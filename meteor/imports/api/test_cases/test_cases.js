import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {TestCaseRoles} from './test_case_roles.js';
import {TestCaseRun} from './test_case_run.js';
import {TestCaseRunRole} from './test_case_run_role.js';
import {TestAgents} from '../test_agents/test_agents.js';
import {DatastoreRows} from '../datastores/datastore_rows.js';
import {TestServers} from '../test_servers/test_servers.js';
import {TestSystems} from '../test_systems/test_systems.js';
import {TestResults} from '../test_results/test_results.js';
import {TestResultRoles} from '../test_results/test_result_roles.js';
import {TestResultSteps} from '../test_results/test_result_steps.js';

/**
 * Test case
 */
export const TestCase = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: SchemaHelpers.autoValueObjectId,
    denyUpdate: true
  },
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
  // Link to a group perhaps via the staticId
  testGroupId: {
    type: String,
    optional: true
  },
  // Test title
  title: {
    type: String
  },
  // Perhaps we'll have descriptions
  description: {
    type: String,
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
  },
  dateModified: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});
export const TestCases = new Mongo.Collection("test_cases");
TestCases.attachSchema(TestCase);
TestCases.deny(Auth.ruleSets.deny.ifNotTester);
TestCases.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(TestCases, "test_cases");

/**
 * Helpers
 */
TestCases.helpers({
  roles() {
    return TestCaseRoles.find({testCaseId: this.staticId, projectVersionId: this.projectVersionId}, {sort: {order: 1}});
  },
  /**
   * Validate the config for running a test case
   * @param config
   */
  validateRunConfig(config) {
    check(config, TestCaseRun);
    var testCase = this;

    // validate that the server exists and is active
    var server = TestServers.findOne({staticId: config.serverId, projectVersionId: testCase.projectVersionId});
    if(!server){
      throw new Meteor.Error("invalid-server", "Test config server not found " + config.serverId, [testCase, config]);
    } else if(!server.active === true){
      throw new Meteor.Error("inactive-server", "Test config server " + server.title + " is not active", [testCase, config, server]);
    }

    // validate that the role config is complete and all systems and agents are active
    var roles = this.roles();

    // There needs to be config for each role
    roles.forEach(function (role) {
      if(config && config.roles[role.staticId]){
        var roleConfig = config.roles[role.staticId];
        check(roleConfig, TestCaseRunRole);

        // validate the role test system
        var testSystem = TestSystems.findOne({staticId: roleConfig.testSystemId, projectVersionId: testCase.projectVersionId});
        if(!testSystem){
          throw new Meteor.Error("invalid-test-system", "Test config test system not found " + roleConfig.testSystemId, [testCase, config, roleConfig]);
        } else if(!testSystem.active === true){
          throw new Meteor.Error("inactive-test-system", "Test config test system " + testSystem.title + " is not active", [testCase, config, testSystem]);
        }

        // validate the role test agent
        var testAgents = TestAgents.findOne({staticId: roleConfig.testAgentId, projectVersionId: testCase.projectVersionId});
        if(!testAgents){
          throw new Meteor.Error("invalid-test-agent", "Test config test agent not found " + roleConfig.testAgentId, [testCase, config, roleConfig]);
        }

        // validate the role account
        var account = DatastoreRows.findOne({_id: roleConfig.accountId});
        if(!account){
          throw new Meteor.Error("invalid-test-account", "Test config account not found " + roleConfig.accountId, [testCase, config, roleConfig]);
        }
      } else {
        throw new Meteor.Error("invalid-run-config", "Test config is missing role " + role.title, [testCase, config, role]);
      }
    });

    // ok
    return true;
  },
  /**
   * Validate the config of and prepare the result records for running a test case
   * @param config
   */
  prepareTestResult(config) {
    check(config, Object);
    var testCase = this;

    if(testCase.validateRunConfig(config)){
      // prepare the records starting with the test result
      var testResultId = TestResults.insert({
        projectId: testCase.projectId,
        projectVersionId: testCase.projectVersionId,
        testCaseId: testCase.staticId,
        testRunId: config.testRunId,
        serverId: config.serverId,
        pauseOnFailure: config.pauseOnFailure
      });

      // create records for each of the test roles
      testCase.roles().forEach(function (role) {
        var roleConfig = config.roles[role.staticId];

        // snapshot the account to use for the test
        roleConfig.dataContext = roleConfig.dataContext || {};
        roleConfig.dataContext.account = DatastoreRows.findOne({_id: roleConfig.accountId});

        var testRoleResultId = TestResultRoles.insert({
          projectId: testCase.projectId,
          projectVersionId: testCase.projectVersionId,
          testRunId: config.testRunId,
          testResultId: testResultId,
          testCaseRoleId: role.staticId,
          testSystemId: roleConfig.testSystemId,
          testAgentId: roleConfig.testAgentId,
          accountId: roleConfig.accountId,
          dataContext: roleConfig.dataContext
        });

        // create records for each step
        role.steps().forEach(function (step) {
          var data = step.data;

          // snapshot the important data for the test step
          data.action = step.action();
          data.node = step.firstNode().withChecks();

          TestResultSteps.insert({
            projectId: testCase.projectId,
            projectVersionId: testCase.projectVersionId,
            testResultId: testResultId,
            testResultRoleId: testRoleResultId,
            testCaseStepId: step.staticId,
            order: step.order,
            type: step.type,
            data: data
          });
        });
      });
      return testResultId;
    }
  }
});
