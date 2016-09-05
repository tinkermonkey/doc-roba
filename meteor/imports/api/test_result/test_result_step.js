import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Auth} from '../auth.js';
import {TestCaseStepTypes} from '../test_case/test_case_step_types.js';
import {TestResultCodes} from './test_result_codes.js';
import {TestResultStatus} from './test_result_status.js';

import {TestCaseSteps} from '../test_case/test_case_step.js';
import {LogMessages} from '../log_message/log_message.js';
import {Screenshots} from '../screenshot/screenshot.js';

/**
 * Test step result - the result for a single user
 */
export const TestResultStep = new SimpleSchema({
  // Link to the project to which this test belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this test belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test run
  testRunId: {
    type: String,
    denyUpdate: true,
    optional: true
  },
  // Link to the test result
  testResultId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test role result
  testResultRoleId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test case step via the staticId
  testCaseStepId: {
    type: String,
    denyUpdate: true
  },
  // The order to run this
  order: {
    type: Number,
    denyUpdate: true
  },
  // The type of test case step
  type: {
    type: Number,
    allowedValues: _.map(TestCaseStepTypes, function (d) { return d; }),
    denyUpdate: true
  },
  // The data from the test step (not the context from the test case run)
  data: {
    type: Object,
    blackbox: true,
    denyUpdate: true,
    optional: true
  },
  // The data context for this step
  dataContext: {
    type: Object,
    blackbox: true,
    denyUpdate: true,
    optional: true
  },
  // The status
  status: {
    type: Number,
    allowedValues: _.map(TestResultStatus, function (d) { return d; }),
    defaultValue: TestResultStatus.staged
  },
  // Various checks done during the course of the step
  checks: {
    type: [Object],
    blackbox: true,
    optional: true
  },
  // The result code
  resultCode: {
    type: Number,
    allowedValues: _.map(TestResultCodes, function (d) { return d; }),
    optional: true
  },
  // The result detail
  result: {
    type: Object,
    blackbox: true,
    optional: true
  }
});
export const TestResultSteps = new Mongo.Collection("test_result_steps");
TestResultSteps.attachSchema(TestResultStep);
TestResultSteps.deny(Auth.ruleSets.deny.ifNotTester);
TestResultSteps.allow(Auth.ruleSets.allow.ifAuthenticated);

/**
 * Helpers
 */
TestResultSteps.helpers({
  testCaseStep: function () {
    return TestCaseSteps.findOne({staticId: this.testCaseStepId, projectVersionId: this.projectVersionId});
  },
  /**
   * Find all of the log messages attributed to this step
   */
  logMessages: function () {
    if(this.isFirst()){
      return LogMessages.find({
        $or: [
          { "context.testResultStepId": this._id },
          { "context.testResultRoleId": this.testResultRoleId, "context.testResultStepId": { $exists: false } }
        ]
      }, {sort: {time: 1}});
    } else {
      return LogMessages.find({ "context.testResultStepId": this._id }, {sort: {time: 1}});
    }
  },
  /**
   * Find the step context message pertaining to this step
   */
  logContextMessage: function () {
    return LogMessages.findOne({ "sender": "context", "data.type": "step", "context.testResultStepId": this._id });
  },
  /**
   * Get all of the test-map relevant context messages in order
   */
  testMapContexts: function () {
    return LogMessages.find({
      "sender": "context",
      "data.type": {$in: ["node", "action"]},
      "context.testResultStepId": this._id
    }, {sort: {time: 1}}).map(function (message, i) {
      // refactor the data for quick access
      if(message.data && message.data.length){
        message.type = message.data[0].type;
        message.data = message.data[0].data;
      }
      return message
    })
  },
  /**
   * Get all of the screenshots for this step
   */
  screenshots: function () {
    return Screenshots.find({ testResultStepId: this._id }, {sort: {uploadedAt: -1}}).map(function (image, i) {image.index = i; return image});
  },
  isFirst: function () {
    return this.order == 0;
  },
  isLast: function () {
    return TestResultSteps.find({testResultRoleId: this.testResultRoleId, order: {$gt: this.order}}).count()
  },
  nextStep: function () {
    return TestResultSteps.findOne({testResultRoleId: this.testResultRoleId, order: this.order + 1})
  },
  previousStep: function () {
    return TestResultSteps.findOne({testResultRoleId: this.testResultRoleId, order: this.order - 1})
  }
});