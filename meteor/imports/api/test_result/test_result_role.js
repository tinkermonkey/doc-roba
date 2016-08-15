import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Auth} from '../auth.js';
import {TestResultCodes} from './test_result_codes.js';
import {TestResultStatus} from './test_result_status.js';

import {TestCaseRoles} from '../test_case/test_case_role.js';
import {TestResults} from './test_result.js';
import {TestResultSteps} from './test_result_step.js';
import {TestSystems} from '../test_system/test_system.js';
import {TestAgents} from '../test_agent/test_agent.js';

/**
 * Test role result - the result for a single user
 */
export const TestResultRole = new SimpleSchema({
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
  // Link to the test case role via the staticId
  testCaseRoleId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test system on which the adventure will execute
  testSystemId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test agent to execute this adventure with
  testAgentId: {
    type: String,
    denyUpdate: true
  },
  // Link to the account to use
  accountId: {
    type: String,
    denyUpdate: true
  },
  // The data context to operate in
  dataContext: {
    type: Object,
    blackbox: true,
    denyUpdate: true
  },
  // The process id for this adventure
  pid: {
    type: Number,
    optional: true
  },
  // The status
  status: {
    type: Number,
    allowedValues: _.map(TestResultStatus, function (d) { return d; }),
    defaultValue: TestResultStatus.staged
  },
  // Abort the test
  abort: {
    type: Boolean,
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
export const TestResultRoles = new Mongo.Collection("test_result_roles");
TestResultRoles.attachSchema(TestResultRole);
TestResultRoles.deny(Auth.ruleSets.deny.ifNotTester);
TestResultRoles.allow(Auth.ruleSets.allow.ifAuthenticated);

/**
 * Helpers
 */
TestResultRoles.helpers({
  role: function () {
    return TestCaseRoles.findOne({staticId: this.testCaseRoleId, projectVersionId: this.projectVersionId});
  },
  steps: function () {
    return TestResultSteps.find({testResultRoleId: this._id}, {sort: {order: 1}});
  },
  testResult: function () {
    return TestResults.findOne({_id: this.testResultId});
  },
  testSystem: function () {
    return TestSystems.findOne({staticId: this.testSystemId, projectVersionId: this.projectVersionId});
  },
  testAgent: function () {
    return TestAgents.findOne({staticId: this.testAgentId, projectVersionId: this.projectVersionId});
  },
  isStaged: function () {
    return this.status = TestResultStatus.staged
  },
  isLaunching: function () {
    return this.status = TestResultStatus.launched
  },
  isRunning: function () {
    return this.status = TestResultStatus.executing
  },
  isDone: function () {
    return _.contains([
      TestResultStatus.complete,
      TestResultStatus.skipped
    ], this.status)
  }
});