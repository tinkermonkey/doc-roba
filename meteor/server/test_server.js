/**
 * Methods and publications to enable test creation and execution
 */
Meteor.startup(function () {
  /**
   * Init
   */

  /**
   * Publications
   */
  Meteor.publish('test_groups', function (projectId, projectVersionId) {
    console.log("Publish: test_groups");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestGroups.find({projectVersionId: projectVersionId});
      }
    }
    console.log("TestGroups publication: returning nothing");
    return [];
  });
  Meteor.publish('test_cases', function (projectId, projectVersionId) {
    console.log("Publish: test_cases");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestCases.find({projectVersionId: projectVersionId});
      }
    }
    console.log("TestCases publication: returning nothing");
    return [];
  });
  Meteor.publish('test_case_roles', function (projectId, projectVersionId, testCaseId) {
    console.log("Publish: test_cases");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestCaseRoles.find({projectVersionId: projectVersionId, testCaseId: testCaseId});
      }
    }
    console.log("TestCases publication: returning nothing");
    return [];
  });
  Meteor.publish('test_case_steps', function (projectId, projectVersionId, testCaseId) {
    console.log("Publish: test_cases");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestCaseSteps.find({projectVersionId: projectVersionId, testCaseId: testCaseId});
      }
    }
    console.log("TestCases publication: returning nothing");
    return [];
  });

  /**
   * publications to support test running
   */
  Meteor.publish('test_result', function (testResultId) {
    return TestResults.find({_id: testResultId});
  });
  Meteor.publish('test_role_result', function (testRoleResultId) {
    return TestRoleResults.find({_id: testRoleResultId});
  });
  Meteor.publish('test_step_results', function (testRoleResultId) {
    return TestStepResults.find({testRoleResultId: testRoleResultId});
  });

  /**
   * Expose these for the client to call
   */
  Meteor.methods({
    /**
     * Return the TestResultStatus enum to a client
     * @returns {TestResultStatus}
     */
    loadTestEnums: function () {
      return {
        resultStatus: TestResultStatus,
        resultCodes: TestResultCodes,
        stepTypes: TestCaseStepTypes
      };
    },
    /**
     * Load the context for a test
     * @param testRoleResultId
     */
    loadTestRole: function (testRoleResultId) {
      check(testRoleResultId, String);

      // load the role and the steps
      var result = {
        role: TestRoleResults.findOne(testRoleResultId),
        steps: TestStepResults.find({testRoleResultId: testRoleResultId}, {sort: {order: 1}}).fetch()
      };

      // load the result
      result.result = TestResults.findOne(result.role.testResultId);

      // load the test system, test agent, and server
      result.system = TestSystems.findOne(result.role.testSystemId);
      result.agent  = TestSystems.findOne(result.role.testAgentId);
      result.server = TestSystems.findOne(result.result.serverId);

      return result;
    },

    /**
     * Set the status of a testRoleResult record
     * @param testRoleResultId
     * @param status
     */
    setTestRoleResultStatus: function (testRoleResultId, status) {
      check(testRoleResultId, String);
      check(status, Number);
      TestRoleResults.update({_id: testRoleResultId}, {$set:{status: status}});
    },

    /**
     * Set the status of a testStepResult record
     * @param testStepResultId
     * @param status
     */
    setTestStepResultStatus: function (testStepResultId, status) {
      check(testStepResultId, String);
      check(status, Number);
      TestStepResults.update({_id: testStepResultId}, {$set:{status: status}});
    },

    /**
     * Set the result code of a testRoleResult record
     * @param testRoleResultId
     * @param code
     */
    setTestRoleResultCode: function (testRoleResultId, code) {
      check(testRoleResultId, String);
      check(code, Number);
      TestRoleResults.update({_id: testRoleResultId}, {$set:{result: code}});
    },

    /**
     * Set the result code of a testStepResult record
     * @param testStepResultId
     * @param code
     */
    setTestStepResultCode: function (testStepResultId, code) {
      check(testStepResultId, String);
      check(code, Number);
      TestStepResults.update({_id: testStepResultId}, {$set:{result: code}});
    },

    /**
     * Save a check for done during a test
     * @param testStepResultId
     * @param status
     */
    saveTestStepResultChecks: function (testStepResultId, checks) {
      check(testStepResultId, String);
      check(checks, Array);
      TestStepResults.update({_id: testStepResultId}, {$set:{checks: checks}});
    },

    /**
     * Load the navigation route for a navigation path
     * @param destinationId
     * @param sourceId
     * @param projectVersionId
     * @param status
     */
    loadNavigationRoute: function (destinationId, sourceId, projectVersionId) {
      check(destinationId, String);
      check(sourceId, String);
      check(projectVersionId, String);

      // grab the nodes
      var destination = Nodes.findOne({staticId: destinationId, projectVersionId: projectVersionId}),
        source, route;

      if(sourceId){
        source = Nodes.findOne({staticId: sourceId, projectVersionId: projectVersionId});
      }

      // fetch the route
      try{
        route = source ? RobaRouter.nodeToNode(source, destination) : RobaRouter.routeFromStart();
        return route.export();
      } catch (error) {
        Meteor.log.error("loadNavigationRoute failed: " + error.message);
      }
    },

    /**
     * Delete a testCase from a test case
     * @param testCase
     */
    deleteTestCase: function (testCase) {
      check(testCase, Object);
      check(testCase.projectId, String);
      check(testCase.projectVersionId, String);
      check(testCase._id, String);

      Meteor.log.debug("deleteTestCase: " + testCase._id);

      // Delete the roles for this testCase
      var roles = TestCaseRoles.find({
        testCaseId: testCase.staticId,
        projectVersionId: testCase.projectVersionId
      }).fetch();
      _.each(roles, function (role) {
        Meteor.call("deleteTestCaseRole", role, function (error) {
          if(error){
            Meteor.log.error("Failed to delete test case role: " + error.message);
          }
        });
      });

      // Delete the testCase
      TestCases.remove({_id: testCase._id});
    },
    /**
     * Delete a role from a test case
     * @param role
     */
    deleteTestCaseRole: function (role) {
      check(role, Object);
      check(role.projectId, String);
      check(role.projectVersionId, String);
      check(role.testCaseId, String);
      check(role._id, String);

      Meteor.log.debug("deleteTestCaseRole: " + role._id);

      // Delete the steps for this role
      TestCaseSteps.remove({ testCaseRoleId: role._id });

      // Delete the role
      TestCaseRoles.remove({_id: role._id});
    },

    /**
     * Launch a test case run
     * @param testResult
     */
    quickLaunchTestCase: function (testResult) {

    }
  });
});
