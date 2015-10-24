/**
 * Methods and publications to enable test creation and execution
 */
Meteor.startup(function () {
  /**
   * ============================================================================
   * Test Run Publications
   * ============================================================================
   */
  Meteor.publish('test_run_templates', function (projectId, projectVersionId) {
    console.log("Publish: test_run_templates");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestRunTemplates.find({projectVersionId: projectVersionId});
      }
    }
    return [];
  });
  Meteor.publish('test_run_template_items', function (projectId, projectVersionId) {
    console.log("Publish: test_run_template_items");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestRunTemplateItems.find({projectVersionId: projectVersionId});
      }
    }
    return [];
  });

  /**
   * ============================================================================
   * Test Case Publications
   * ============================================================================
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
    return [];
  });
  Meteor.publish('test_case', function (projectId, projectVersionId, testCaseId) {
    console.log("Publish: test_case");
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestCases.find({projectVersionId: projectVersionId, staticId: testCaseId});
      }
    }
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
    return [];
  });

  /**
   * ============================================================================
   * Test Result Publications
   * ============================================================================
   */
  Meteor.publish('test_case_results', function (projectId, testCaseId, limit) {
    console.log("Publish: test_case_results", testCaseId, limit);
    // check that there is a project role for the current user
    if(this.userId && projectId && testCaseId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        limit = limit || 10;
        var options = {sort: { dateCreated: -1 }};
        if(limit > 0){
          options.limit = limit;
        }
        return TestResults.find({
          testCaseId: testCaseId
        }, options);
      }
    }
    return [];
  });
  Meteor.publish('test_result', function (projectId, testResultId) {
    console.log("Publish: test_result");
    // check that there is a project role for the current user
    if(this.userId && projectId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestResults.find(testResultId);
      }
    }
    return [];
  });
  Meteor.publish('test_result_roles', function (projectId, testResultId) {
    console.log("Publish: test_result_roles");
    // check that there is a project role for the current user
    if(this.userId && projectId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestRoleResults.find({testResultId: testResultId});
      }
    }
    return [];
  });
  Meteor.publish('test_result_steps', function (projectId, testResultId) {
    console.log("Publish: test_result_steps");
    // check that there is a project role for the current user
    if(this.userId && projectId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestStepResults.find({testResultId: testResultId});
      }
    }
    return [];
  });
  Meteor.publish('test_result_log', function (projectId, testResultId) {
    console.log("Publish: test_result_log");
    // check that there is a project role for the current user
    if(this.userId && projectId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return LogMessages.find({"context.testResultId": testResultId});
      }
    }
    return [];
  });
  Meteor.publish('test_result_screenshots', function (projectId, testResultId) {
    console.log("Publish: test_result_screenshots");
    // check that there is a project role for the current user
    if(this.userId && projectId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return ScreenShots.find({testResultId: testResultId});
      }
    }
    return [];
  });
  Meteor.publish('test_run_result', function (testResultId) {
    console.log("Publish: test_run_result");
    // check that there is a project role for the current user
    if(this.userId){
      return TestResults.find(testResultId);
    }
    return [];
  });

  //TODO: remove this publication once testing is complete
  Meteor.publish('screenshots', function (testResultId) {
    return ScreenShots.find();
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
        stepTypes: TestCaseStepTypes,
        screenshotKeys: ScreenshotKeys
      };
    },
    /**
     * Load the context for a test role execution
     * @param testRoleResultId
     */
    loadTestRoleManifest: function (testRoleResultId) {
      check(testRoleResultId, String);
      Meteor.log.debug("loadTestRoleManifest: ", testRoleResultId);

      // Require authentication
      if(!this.userId){
        throw new Meteor.Error("Authentication Failed", "User is not authenticated");
      }

      // load the role and the steps
      var result = {
        role: TestRoleResults.findOne(testRoleResultId),
        steps: TestStepResults.find({testRoleResultId: testRoleResultId}, {sort: {order: 1}}).fetch()
      };

      // load the result
      result.result = TestResults.findOne(result.role.testResultId);

      // load the test system, test agent, and server
      result.system = TestSystems.findOne({staticId: result.role.testSystemId, projectVersionId: result.role.projectVersionId});
      result.agent  = TestAgents.findOne({staticId: result.role.testAgentId, projectVersionId: result.role.projectVersionId});
      result.server = Servers.findOne({staticId: result.result.serverId, projectVersionId: result.role.projectVersionId});

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
      if(checks){
        TestStepResults.update({_id: testStepResultId}, {$set:{checks: checks}});
      }
    },

    /**
     * Save the context for a screenshot
     * @param imageId
     * @param context
     */
    saveScreenshotContext: function (imageId, context) {
      check(imageId, String);
      check(context, Object);
      ScreenShots.update(imageId, {$set: context});
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
     * @param testCaseId
     */
    quickLaunchTestCase: function (testCaseId) {

    },

    /**
     * Create a test test case result to run
     * @param testCaseId
     */
    createDemoTestResult: function (testCaseId) {
      var testCase = TestCases.findOne(testCaseId || "FbcpXNeHvrDToZXu6"),
        testCaseRoles = TestCaseRoles.find({
          testCaseId: testCase.staticId,
          projectVersionId: testCase.projectVersionId
        }).fetch(),
        server = Servers.findOne({
          projectVersionId: testCase.projectVersionId,
          active: true
        }),
        testSystem = TestSystems.findOne({
          projectVersionId: testCase.projectVersionId,
          active: true
        }),
        testAgent = TestAgents.findOne({
          projectVersionId: testCase.projectVersionId,
          staticId: {$in: testSystem.testAgents }
        });

      // Create a testResult record
      var testResultId = TestResults.insert({
        projectId: testCase.projectId,
        projectVersionId: testCase.projectVersionId,
        testCaseId: testCase.staticId,
        serverId: server.staticId
      });

      // Create the testResult Roles
      var testRoleResultIds = [];
      _.each(testCaseRoles, function (testCaseRole) {
        console.log("Creating TestRoleResult for testCaseRole: ", testCaseRole.title, testCaseRole.staticId);

        // identify the usertype(s) for this role
        var nodeStep = TestCaseSteps.findOne({
            projectVersionId: testCase.projectVersionId,
            testCaseRoleId: testCaseRole.staticId,
            type: TestCaseStepTypes.node,
            "data.nodeId": { $exists: true }
          }),
          userTypeNode = Nodes.findOne({
            projectVersionId: testCase.projectVersionId,
            staticId: nodeStep.data.nodeId
          }),
          userType = Util.getNodePlatformUserType(userTypeNode).userType;
        console.log("Using node step to determine userType: ", nodeStep);
        console.log("Using node to determine userType: ", userType);

        if(!userType){
          Meteor.log.error("Could not get userType for node: ", userTypeNode, nodeStep);
          return;
        }

        // get the account for this role
        var userStore = DataStores.findOne({
          dataKey: userType
        });
        if(!userStore){
          Meteor.log.error("Could not get userStore for userType: " + userType);
          return;
        }

        var account = DataStoreRows.findOne({dataStoreId: userStore._id}, {sort: {dateCreated: 1}});

        // get the steps
        var testCaseSteps = TestCaseSteps.find({
          projectVersionId: testCase.projectVersionId,
          testCaseRoleId: testCaseRole.staticId
        }, {sort: {order: 1}}).fetch();

        // create the role result
        var roleResultId = TestRoleResults.insert({
          projectId: testCase.projectId,
          projectVersionId: testCase.projectVersionId,
          testResultId: testResultId,
          testCaseRoleId: testCaseRole.staticId,
          testSystemId: testSystem.staticId,
          testAgentId: testAgent.staticId,
          dataContext: {
            account: account
          }
        });
        testRoleResultIds.push(roleResultId);

        // create the step results
        _.each(testCaseSteps, function (step) {
          // fetch the data needed for this step
          var data = step.data;

          // this only applies to node and action steps
          // - route steps are done live to be nimble
          // - wait doesn't need data ahead of time
          // - custom is just custom
          switch(step.type){
            case TestCaseStepTypes.node:
              data.node = Nodes.findOne({staticId: step.data.nodeId, projectVersionId: testCase.projectVersionId});
              break;
            case TestCaseStepTypes.action:
              data.action = Actions.findOne({staticId: step.data.actionId, projectVersionId: testCase.projectVersionId});
              data.node = Nodes.findOne({staticId: step.data.nodeId, projectVersionId: testCase.projectVersionId});
              break;
          }

          TestStepResults.insert({
            projectId: testCase.projectId,
            projectVersionId: testCase.projectVersionId,
            testResultId: testResultId,
            testRoleResultId: roleResultId,
            testCaseStepId: step.staticId,
            order: step.order,
            type: step.type,
            data: data,
            dataContext: {}
          });
        })
      });
      return testResultId;
    },

    /**
     * Launch a test result run
     */
    launchTestResult: function (testResultId) {
      check(testResultId, String);
      check(Meteor.user(), Object);
      Meteor.log.info("launchTestResult: " + testResultId);

      // do some quick cleanup in case this is a re-run
      LogMessages.remove({"context.testResultId": testResultId});
      ScreenShots.remove({testResultId: testResultId});
      TestResults.update({_id: testResultId}, {$set: {status: TestResultStatus.staged, abort: false}, $unset: {result: ""}});
      TestRoleResults.update({testResultId: testResultId}, {$set: {status: TestResultStatus.staged}, $unset: {result: "", pid: ""}});
      TestStepResults.update({testResultId: testResultId}, {$set: {status: TestResultStatus.staged}, $unset: {result: "", checks: ""}});

      // get the list of roles, create a launch token and fire away
      TestRoleResults.find({testResultId: testResultId}).forEach(function (role) {
        Meteor.log.info("launchTestResult launching role: " + role._id);
        var token = Accounts.singleUseAuth.generate({ expires: { seconds: 5 } }),
          command = [ProcessLauncher.testRoleScript, "--roleId", role._id, "--token", token].join(" "),
          logFile = ["test_role_result_", role._id, ".log"].join(""),
          proc = ProcessLauncher.launchAutomation(command, logFile);

        TestRoleResults.update(role._id, {$set: {pid: proc.pid}});
        Meteor.log.info("launchTestResult launched: " + role._id + " as " + proc.pid + " > " + logFile);
      });
    }
  });
});
