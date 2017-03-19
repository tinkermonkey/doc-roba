import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { Auth } from '../auth.js';
import { TestResultCodes } from './test_result_codes.js';
import { TestResultStatus } from './test_result_status.js';
import { TestResultRoles } from './test_result_roles.js';
import { TestResultSteps } from './test_result_steps.js';
import { Projects } from '../projects/projects.js';
import { ProjectVersions } from '../projects/project_versions';
import { TestCases } from '../test_cases/test_cases.js';
import { TestServers } from '../test_servers/test_servers.js';
import { TestRuns } from '../test_runs/test_runs.js';
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
  /**
   * Get the TestResultRoles for this TestResult
   * @return [TestResultRole]
   */
  roleResults() {
    return TestResultRoles.find({ testResultId: this._id });
  },
  /**
   * Get the Project record for this TestResult
   * @return Project
   */
  project() {
    return Projects.findOne({ _id: this.projectId });
  },
  /**
   * Get the ProjectVersion record for this TestResult
   * @return ProjectVersion
   */
  projectVersion() {
    return ProjectVersions.findOne({ _id: this.projectVersionId });
  },
  /**
   * Get the TestCase record that this TestResult represents
   * @return TestCase
   */
  testCase() {
    return TestCases.findOne({ staticId: this.testCaseId, projectVersionId: this.projectVersionId });
  },
  /**
   * Get the TestServer record that this TestResult is being generated against
   * @return TestServer
   */
  server() {
    return TestServers.findOne({ staticId: this.serverId, projectVersionId: this.projectVersionId });
  },
  /**
   * Get the TestRun record that this TestResult belongs to
   * @return TestRun
   */
  testRun() {
    return TestRuns.findOne({ staticId: this.testRunId, projectVersionId: this.projectVersionId });
  },
  /**
   * Determine if this TestResult is currently staged
   * @return {boolean}
   */
  isStaged() {
    return this.status == TestResultStatus.staged
  },
  /**
   * Determine if this TestResult is currently launched
   * @return {boolean}
   */
  isLaunching() {
    return this.status == TestResultStatus.launched
  },
  /**
   * Determine if this TestResult is currently running
   * @return {boolean}
   */
  isRunning() {
    return this.status == TestResultStatus.executing
  },
  /**
   * Determine if this TestResult has completed
   * @return {boolean}
   */
  isDone() {
    return _.contains([
      TestResultStatus.complete,
      TestResultStatus.skipped
    ], this.status)
  }
});