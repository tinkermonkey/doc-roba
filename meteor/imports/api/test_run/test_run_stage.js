import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../_lib/schema_helpers.js';
import {Auth} from '../_lib/auth.js';
import {TestResultStatus} from '../test_result/test_result_status.js';
import {TestResultCodes} from '../test_result/test_result_codes.js';

/**
 * Test run stage
 */
export const TestRunStage = new SimpleSchema({
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
  // Link to test run template
  parentId: {
    type: String,
    denyUpdate: true
  },
  // The status
  status: {
    type: Number,
    allowedValues: _.map(TestResultStatus, function (d) { return d; }),
    defaultValue: TestResultStatus.staged
  },
  // The result
  result: {
    type: Number,
    allowedValues: _.map(TestResultCodes, function (d) { return d; }),
    optional: true
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueCreatedBy,
    denyUpdate: true
  }
});
export const TestRunStages = new Mongo.Collection("test_run_stages");
TestRunStages.attachSchema(TestRunStage);
TestRunStages.deny(Auth.ruleSets.deny.ifNotTester);
TestRunStages.allow(Auth.ruleSets.allow.ifAuthenticated);
