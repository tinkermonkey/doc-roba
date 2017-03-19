import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Auth } from '../auth.js';
import { TestResultCodes } from './test_result_codes.js';
import { TestResultStatus } from './test_result_status.js';
import { TestCaseRoles } from '../test_cases/test_case_roles.js';
import { TestResults } from './test_results.js';
import { TestResultSteps } from './test_result_steps.js';
import { TestSystems } from '../test_systems/test_systems.js';
import { TestAgents } from '../test_agents/test_agents.js';

/**
 * Test role result - the result for a single user
 */
export const TestResultRole  = new SimpleSchema({
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
  // Link to the test result
  testResultId    : {
    type      : String,
    denyUpdate: true
  },
  // Link to the test case role via the staticId
  testCaseRoleId  : {
    type      : String,
    denyUpdate: true
  },
  // Link to the test system on which the adventure will execute
  testSystemId    : {
    type      : String,
    denyUpdate: true
  },
  // Link to the test agent to execute this adventure with
  testAgentId     : {
    type      : String,
    denyUpdate: true
  },
  // Link to the account to use
  accountId       : {
    type      : String,
    denyUpdate: true
  },
  // The data context to operate in
  dataContext     : {
    type      : Object,
    blackbox  : true,
    denyUpdate: true
  },
  // The process id for this adventure
  pid             : {
    type    : Number,
    optional: true
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
  /**
   * Get the role definition from the test case
   * @return TestCaseRole
   */
  role() {
    return TestCaseRoles.findOne({ staticId: this.testCaseRoleId, projectVersionId: this.projectVersionId });
  },
  /**
   * Get the TestResultSteps for this role
   * @return [TestResultStep]
   */
  steps() {
    return TestResultSteps.find({ testResultRoleId: this._id }, { sort: { order: 1 } });
  },
  /**
   * Get the TestResult record for this role
   * @return TestResult
   */
  testResult() {
    return TestResults.findOne({ _id: this.testResultId });
  },
  /**
   * Get the TestSystem record for this role
   * @return TestSystem
   */
  testSystem() {
    return TestSystems.findOne({ staticId: this.testSystemId, projectVersionId: this.projectVersionId });
  },
  /**
   * Get the TestAgent record for this role
   * @return TestAgent
   */
  testAgent() {
    return TestAgents.findOne({ staticId: this.testAgentId, projectVersionId: this.projectVersionId });
  },
  /**
   * Determine if this role is staged
   * @return {boolean}
   */
  isStaged() {
    return this.status == TestResultStatus.staged
  },
  /**
   * Determine if this role is launched
   * @return {boolean}
   */
  isLaunching() {
    return this.status == TestResultStatus.launched
  },
  /**
   * Determine if this role is running
   * @return {boolean}
   */
  isRunning() {
    return this.status == TestResultStatus.executing
  },
  /** Determine if this role has completed
   * @return {boolean}
   */
  isDone() {
    return _.contains([
      TestResultStatus.complete,
      TestResultStatus.skipped
    ], this.status)
  },
  /**
   * Create the test manifest for this role
   */
  manifest(){
    let testReslt      = this.testResult(),
        platformConfig = this.platformConfig();
    return {
      role    : this,
      steps   : this.steps().fetch(),
      result  : testResult(),
      system  : this.testSystem(),
      agent   : this.testAgent(),
      server  : testResult().server(),
      config  : platformConfig,
      viewport: platformConfig && platformConfig.defaultViewport()
    };
  },
  /**
   * Get the platform configuration for this role
   */
  platformConfig(){
    // Iterate through the steps until we find a node and get the platform from that
    this.steps().forEach((step) => {
      let node = step.testCaseStep().firstNode();
      if (node) {
        return node.platformConfig()
      }
    });
  }
});