/**
 * ============================================================================
 * Test case
 * ============================================================================
 */
Schemas.TestCase = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: autoValueObjectId,
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
    autoValue: autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type: Date,
    autoValue: autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: autoValueModifiedBy
  }
});
Collections.TestCases = new Mongo.Collection("test_cases");
Collections.TestCases.attachSchema(Schemas.TestCase);
Collections.TestCases.deny(Auth.ruleSets.deny.ifNotTester);
Collections.TestCases.allow(Auth.ruleSets.allow.ifAuthenticated);
trackChanges(Collections.TestCases, "test_cases");

/**
 * Schema for configuring a test case run
 */
Schemas.TestCaseRunRole = new SimpleSchema({
  testSystemId: {
    type: String
  },
  testAgentId: {
    type: String
  },
  accountId: {
    type: String
  },
  dataContext: {
    type: Object,
    optional: true
  }
});
Schemas.TestCaseRun = new SimpleSchema({
  serverId: {
    type: String
  },
  roles: {
    type: Object,
    blackbox: true
  },
  testRunId: {
    type: String,
    optional: true
  },
  pauseOnFailure: {
    type: Boolean,
    optional: true
  }
});

/**
 * Helpers
 */
Collections.TestCases.helpers({
  roles: function () {
    return Collections.TestCaseRoles.find({testCaseId: this.staticId, projectVersionId: this.projectVersionId}, {sort: {order: 1}});
  },
  /**
   * Validate the config for running a test case
   * @param config
   */
  validateRunConfig: function (config) {
    check(config, Schemas.TestCaseRun);
    var testCase = this;

    // validate that the server exists and is active
    var server = Collections.Servers.findOne({staticId: config.serverId, projectVersionId: testCase.projectVersionId});
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
        check(roleConfig, Schemas.TestCaseRunRole);

        // validate the role test system
        var testSystem = Collections.TestSystems.findOne({staticId: roleConfig.testSystemId, projectVersionId: testCase.projectVersionId});
        if(!testSystem){
          throw new Meteor.Error("invalid-test-system", "Test config test system not found " + roleConfig.testSystemId, [testCase, config, roleConfig]);
        } else if(!testSystem.active === true){
          throw new Meteor.Error("inactive-test-system", "Test config test system " + testSystem.title + " is not active", [testCase, config, testSystem]);
        }

        // validate the role test agent
        var testAgents = Collections.TestAgents.findOne({staticId: roleConfig.testAgentId, projectVersionId: testCase.projectVersionId});
        if(!testAgents){
          throw new Meteor.Error("invalid-test-agent", "Test config test agent not found " + roleConfig.testAgentId, [testCase, config, roleConfig]);
        }

        // validate the role account
        var account = Collections.DataStoreRows.findOne({_id: roleConfig.accountId});
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
  prepareTestResult: function (config) {
    check(config, Object);
    var testCase = this;

    if(testCase.validateRunConfig(config)){
      // prepare the records starting with the test result
      var testResultId = Collections.TestResults.insert({
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
        roleConfig.dataContext.account = Collections.DataStoreRows.findOne({_id: roleConfig.accountId});

        var testRoleResultId = Collections.TestResultRoles.insert({
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
          data.node = step.firstNode();

          Collections.TestResultSteps.insert({
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
