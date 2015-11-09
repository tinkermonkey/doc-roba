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
    console.log("Publish: test_case_results:", testCaseId, limit);
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
    console.log("Publish: test_result:", projectId, testResultId);
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
    console.log("Publish: test_result_roles:", projectId, testResultId);
    // check that there is a project role for the current user
    if(this.userId && projectId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        console.log("TestResultRoles:", TestResultRoles.find({testResultId: testResultId}).count());
        return TestResultRoles.find({testResultId: testResultId});
      }
    }
    return [];
  });
  Meteor.publish('test_result_steps', function (projectId, testResultId) {
    console.log("Publish: test_result_steps:", projectId, testResultId);
    // check that there is a project role for the current user
    if(this.userId && projectId){
      var role = ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return TestResultSteps.find({testResultId: testResultId});
      }
    }
    return [];
  });
  Meteor.publish('test_result_log', function (projectId, testResultId) {
    console.log("Publish: test_result_log:", projectId, testResultId);
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
    console.log("Publish: test_result_screenshots:", projectId, testResultId);
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
    console.log("Publish: test_run_result:", testResultId);
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
      check(Meteor.user(), Object);
      return {
        resultStatus: TestResultStatus,
        resultCodes: TestResultCodes,
        stepTypes: TestCaseStepTypes,
        screenshotKeys: ScreenshotKeys
      };
    },
    /**
     * Load the context for a test role execution
     * @param testResultRoleId
     */
    loadTestRoleManifest: function (testResultRoleId) {
      check(Meteor.user(), Object);
      check(testResultRoleId, String);
      Meteor.log.debug("loadTestRoleManifest: ", testResultRoleId);

      // Require authentication
      if(!this.userId){
        throw new Meteor.Error("Authentication Failed", "User is not authenticated");
      }

      // load the role and the steps
      var result = {
        role: TestResultRoles.findOne(testResultRoleId),
        steps: TestResultSteps.find({testResultRoleId: testResultRoleId}, {sort: {order: 1}}).fetch()
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
     * Set the status of a testResultRole record
     * @param testResultRoleId
     * @param status
     */
    setTestResultRoleStatus: function (testResultRoleId, status) {
      check(Meteor.user(), Object);
      check(testResultRoleId, String);
      check(status, Number);
      TestResultRoles.update({_id: testResultRoleId}, {$set:{status: status}});
    },

    /**
     * Set the status of a testResultStep record
     * @param testResultStepId
     * @param status
     */
    setTestResultStepStatus: function (testResultStepId, status) {
      check(Meteor.user(), Object);
      check(testResultStepId, String);
      check(status, Number);
      TestResultSteps.update({_id: testResultStepId}, {$set:{status: status}});
    },

    /**
     * Set the result code of a testResultRole record
     * @param testResultRoleId
     * @param code
     */
    setTestResultRoleCode: function (testResultRoleId, code) {
      check(Meteor.user(), Object);
      check(testResultRoleId, String);
      check(code, Number);
      TestResultRoles.update({_id: testResultRoleId}, {$set:{result: code}});
    },

    /**
     * Set the result code of a testResultStep record
     * @param testResultStepId
     * @param code
     */
    setTestResultStepCode: function (testResultStepId, code) {
      check(Meteor.user(), Object);
      check(testResultStepId, String);
      check(code, Number);
      TestResultSteps.update({_id: testResultStepId}, {$set:{result: code}});
    },

    /**
     * Save a check for done during a test
     * @param testResultStepId
     * @param status
     */
    saveTestResultStepChecks: function (testResultStepId, checks) {
      check(Meteor.user(), Object);
      check(testResultStepId, String);
      if(checks){
        TestResultSteps.update({_id: testResultStepId}, {$set:{checks: checks}});
      }
    },

    /**
     * Save the context for a screenshot
     * @param imageId
     * @param context
     */
    saveScreenshotContext: function (imageId, context) {
      check(Meteor.user(), Object);
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
      check(Meteor.user(), Object);
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
      check(Meteor.user(), Object);
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
      check(Meteor.user(), Object);
      check(role, Object);
      check(role._id, String);

      Meteor.log.debug("deleteTestCaseRole: " + role._id);

      // Delete the steps for this role
      TestCaseSteps.remove({ testCaseRoleId: role._id });

      // Delete the role
      TestCaseRoles.remove({_id: role._id});
    },

    /**
     * Validate a test case run config
     * @param testCaseId
     * @param config Must pass Schemas.TestCaseRun validation
     */
    validateTestCaseRunConfig: function (testCaseId, config) {
      check(Meteor.user(), Object);
      check(testCaseId, String);
      check(config, Object);
      Meteor.log.info("validateTestCaseRunConfig: " + testCaseId);

      var testCase = TestCases.findOne(testCaseId);

      // validate user permissions

      if(!testCase && testCase._id){
        throw new Meteor.Error("unknown-testCase", "A testCase with id [" + testCaseId + "] was not found");
      }

      // check that the config has data for all of the roles
      return testCase.validateRunConfig(config);
    },

    /**
     * Prepare a test case run
     * @param testCaseId
     * @param config Must pass Schemas.TestCaseRun validation
     */
    prepareTestCaseRun: function (testCaseId, config) {
      check(Meteor.user(), Object);
      check(testCaseId, String);
      check(config, Object);
      Meteor.log.info("prepareTestCaseRun: " + testCaseId);

      var testCase = TestCases.findOne(testCaseId);

      // validate user permissions

      if(!testCase && testCase._id){
        throw new Meteor.Error("unknown-testCase", "A testCase with id [" + testCaseId + "] was not found");
      }

      // check that the config has data for all of the roles
      var testResultId = testCase.prepareTestResult(config);
      Meteor.log.info("prepareTestCaseRun.testResultId: " + testResultId);
      return testResultId;
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
      var testResultRoleIds = [];
      _.each(testCaseRoles, function (testCaseRole) {
        console.log("Creating TestResultRole for testCaseRole: ", testCaseRole.title, testCaseRole.staticId);

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
        var roleResultId = TestResultRoles.insert({
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
        testResultRoleIds.push(roleResultId);

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

          TestResultSteps.insert({
            projectId: testCase.projectId,
            projectVersionId: testCase.projectVersionId,
            testResultId: testResultId,
            testResultRoleId: roleResultId,
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
      check(Meteor.user(), Object);
      check(testResultId, String);
      Meteor.log.info("launchTestResult: " + testResultId);

      var testResult = TestResults.findOne(testResultId);

      // validate user permissions

      if(testResult){
        testResult.launch();
      } else {
        throw new Meteor.Error("invalid-testResult", "launchTestResult failed because the result could not be found", testResultId);
      }
      return;
      /*
      // do some quick cleanup in case this is a re-run
      LogMessages.remove({"context.testResultId": testResultId});
      ScreenShots.remove({testResultId: testResultId});
      TestResults.update({_id: testResultId}, {$set: {status: TestResultStatus.staged, abort: false}, $unset: {result: ""}});
      TestResultRoles.update({testResultId: testResultId}, {$set: {status: TestResultStatus.staged}, $unset: {result: "", pid: ""}});
      TestResultSteps.update({testResultId: testResultId}, {$set: {status: TestResultStatus.staged}, $unset: {result: "", checks: ""}});

      // get the list of roles, create a launch token and fire away
      TestResultRoles.find({testResultId: testResultId}).forEach(function (role) {
        Meteor.log.info("launchTestResult launching role: " + role._id);
        var token = Accounts.singleUseAuth.generate({ expires: { seconds: 5 } }),
          command = [ProcessLauncher.testRoleScript, "--roleId", role._id, "--token", token].join(" "),
          logFile = ["test_result_role_", role._id, ".log"].join(""),
          proc = ProcessLauncher.launchAutomation(command, logFile);

        TestResultRoles.update(role._id, {$set: {pid: proc.pid}});
        Meteor.log.info("launchTestResult launched: " + role._id + " as " + proc.pid + " > " + logFile);
      });
      */
    }
  });
});
