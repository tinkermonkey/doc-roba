import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';

/**
 * Test run - the setup for the running of multiple test cases
 */
export const TestRun = new SimpleSchema({
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
  testRunTemplateId: {
    type: String,
    denyUpdate: true
  },
  // Link to the server we're running against
  serverId: {
    type: String,
    denyUpdate: true
  },
  // Whether to wait for commands if there is a problem
  pauseOnFailure: {
    type: Boolean,
    defaultValue: false
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
export const TestRuns = new Mongo.Collection("test_runs");
TestRuns.attachSchema(TestRun);
TestRuns.deny(Auth.ruleSets.deny.ifNotTester);
TestRuns.allow(Auth.ruleSets.allow.ifAuthenticated);
