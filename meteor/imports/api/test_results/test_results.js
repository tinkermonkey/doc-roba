import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { Auth } from '../auth.js';
import { TestResultCodes } from './test_result_codes.js';
import { TestResultStatus } from './test_result_status.js';
import { TestResultRoles } from './test_result_role.js';
import { TestResultSteps } from './test_result_step.js';
import { Projects } from '../projects/projects.js';
import { ProjectVersions } from '../projects/project_versions';
import { TestCases } from '../test_cases/test_cases.js';
import { TestServers } from '../test_server/test_server.js';
import { TestRuns } from '../test_run/test_run.js';
import { LogMessages } from '../log_messages/log_messages.js';
import { Screenshots } from '../screenshots/screenshots.js';

/**
 * Test case result - the umbrella result for a test execution
 */
export const TestResult  = new SimpleSchema({
  // Link to the project to which this test belongs
  projectId       : {
    type      : String,
    denyUpdate: true
  },
  // Link to the project version to which this test belongs
  projectVersionId: {
    type      : String,
    denyUpdate: true
  },
  // Link to the test run
  testRunId       : {
    type      : String,
    denyUpdate: true,
    optional  : true
  },
  // Link to the test case via the staticId
  testCaseId      : {
    type      : String,
    denyUpdate: true
  },
  // Link to the server we're running against
  serverId        : {
    type      : String,
    denyUpdate: true
  },
  // Whether to wait for commands if there is a problem
  pauseOnFailure  : {
    type        : Boolean,
    defaultValue: false
  },
  // The status
  status          : {
    type         : Number,
    allowedValues: _.map(TestResultStatus, function (d) {
      return d;
    }),
    defaultValue : TestResultStatus.staged
  },
  // Abort the test
  abort           : {
    type    : Boolean,
    optional: true
  },
  // The result code
  resultCode      : {
    type         : Number,
    allowedValues: _.map(TestResultCodes, function (d) {
      return d;
    }),
    optional     : true
  },
  // The result detail
  result          : {
    type    : Object,
    blackbox: true,
    optional: true
  },
  // Standard tracking fields
  dateCreated     : {
    type      : Date,
    autoValue : SchemaHelpers.autoValueDateCreated,
    denyUpdate: true
  },
  createdBy       : {
    type      : String,
    autoValue : SchemaHelpers.autoValueCreatedBy,
    denyUpdate: true
  }
});
export const TestResults = new Mongo.Collection("test_results");
TestResults.attachSchema(TestResult);
TestResults.deny(Auth.ruleSets.deny.ifNotTester);
TestResults.allow(Auth.ruleSets.allow.ifAuthenticated);

/**
 * Helpers
 */
TestResults.helpers({
  roleResults() {
    return TestResultRoles.find({ testResultId: this._id });
  },
  project() {
    return Projects.findOne({ _id: this.projectId });
  },
  projectVersion() {
    return ProjectVersions.findOne({ _id: this.projectVersionId });
  },
  testCase() {
    return TestCases.findOne({ staticId: this.testCaseId, projectVersionId: this.projectVersionId });
  },
  server() {
    return TestServers.findOne({ staticId: this.serverId, projectVersionId: this.projectVersionId });
  },
  testRun() {
    return TestRuns.findOne({ staticId: this.testRunId, projectVersionId: this.projectVersionId });
  },
  isStaged() {
    return this.status = TestResultStatus.staged
  },
  isLaunching() {
    return this.status = TestResultStatus.launched
  },
  isRunning() {
    return this.status = TestResultStatus.executing
  },
  isDone() {
    return _.contains([
      TestResultStatus.complete,
      TestResultStatus.skipped
    ], this.status)
  }
});