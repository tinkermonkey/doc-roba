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
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestRunTemplates.find({projectVersionId: projectVersionId});
      }
    }
    return [];
  });
  Meteor.publish('test_run_template_items', function (projectId, projectVersionId) {
    console.log("Publish: test_run_template_items");
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestRunTemplateItems.find({projectVersionId: projectVersionId});
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
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestGroups.find({projectVersionId: projectVersionId});
      }
    }
    return [];
  });
  Meteor.publish('test_cases', function (projectId, projectVersionId) {
    console.log("Publish: test_cases");
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestCases.find({projectVersionId: projectVersionId});
      }
    }
    return [];
  });
  Meteor.publish('test_case', function (projectId, projectVersionId, testCaseId) {
    console.log("Publish: test_case");
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestCases.find({projectVersionId: projectVersionId, staticId: testCaseId});
      }
    }
    return [];
  });
  Meteor.publish('test_case_roles', function (projectId, projectVersionId, testCaseId) {
    console.log("Publish: test_cases");
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestCaseRoles.find({projectVersionId: projectVersionId, testCaseId: testCaseId});
      }
    }
    return [];
  });
  Meteor.publish('test_case_steps', function (projectId, projectVersionId, testCaseId) {
    console.log("Publish: test_cases");
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId && projectVersionId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestCaseSteps.find({projectVersionId: projectVersionId, testCaseId: testCaseId});
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
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId && testCaseId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        limit = limit || 10;
        var options = {sort: { dateCreated: -1 }};
        if(limit > 0){
          options.limit = limit;
        }
        return Collections.TestResults.find({
          testCaseId: testCaseId
        }, options);
      }
    }
    return [];
  });
  Meteor.publish('test_result', function (projectId, testResultId) {
    console.log("Publish: test_result:", projectId, testResultId);
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestResults.find(testResultId);
      }
    }
    return [];
  });
  Meteor.publish('test_result_roles', function (projectId, testResultId) {
    console.log("Publish: test_result_roles:", projectId, testResultId);
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        console.log("TestResultRoles:", Collections.TestResultRoles.find({testResultId: testResultId}).count());
        return Collections.TestResultRoles.find({testResultId: testResultId});
      }
    }
    return [];
  });
  Meteor.publish('test_result_steps', function (projectId, testResultId) {
    console.log("Publish: test_result_steps:", projectId, testResultId);
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.TestResultSteps.find({testResultId: testResultId});
      }
    }
    return [];
  });
  Meteor.publish('test_result_log', function (projectId, testResultId) {
    console.log("Publish: test_result_log:", projectId, testResultId);
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.LogMessages.find({"context.testResultId": testResultId});
      }
    }
    return [];
  });
  Meteor.publish('test_result_screenshots', function (projectId, testResultId) {
    console.log("Publish: test_result_screenshots:", projectId, testResultId);
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId && projectId){
      var role = Collections.ProjectRoles.findOne({userId: this.userId, projectId: projectId});
      if(role){
        return Collections.Screenshots.find({testResultId: testResultId});
      }
    }
    return [];
  });
  Meteor.publish('test_run_result', function (testResultId) {
    console.log("Publish: test_run_result:", testResultId);
    check(this.userId, String);
    // check that there is a project role for the current user
    if(this.userId){
      return Collections.TestResults.find(testResultId);
    }
    return [];
  });

  /**
   * ============================================================================
   * Screenshot Publications
   * ============================================================================
   */
  Meteor.publish('similar_screenshots', function (screenshotId) {
    console.log("Publish: similar_screenshots:", screenshotId);
    check(this.userId, String);
    check(screenshotId, String);
    var screenshot = Collections.Screenshots.findOne(screenshotId);
    if(screenshot){
      return Collections.Screenshots.similarScreenshots(screenshot);
    }
    return [];
  });

  Meteor.publish('previous_version_screenshots', function (screenshotId) {
    console.log("Publish: previous_version_screenshots:", screenshotId);
    check(this.userId, String);
    check(screenshotId, String);
    var screenshot = Collections.Screenshots.findOne(screenshotId);
    if(screenshot){
      return Collections.Screenshots.similarScreenshots(screenshot);
    }
    return [];
  });

  Meteor.publish('screenshot_comparison', function (baseScreenshotId, compareScreenshotId) {
    console.log("Publish: screenshot_comparison:", baseScreenshotId, compareScreenshotId);
    check(this.userId, String);
    check(baseScreenshotId, String);
    check(compareScreenshotId, String);
    return Collections.ScreenshotComparisons.find({baseScreenshot: baseScreenshotId, compareScreenshot: compareScreenshotId});
  });

  //TODO: remove this publication once testing is complete
  Meteor.publish('screenshots', function () {
    console.log("Publish: screenshots");
    check(this.userId, String);
    return Collections.Screenshots.find();
  });


  /**
   * ============================================================================
   * Methods
   * ============================================================================
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
        role: Collections.TestResultRoles.findOne(testResultRoleId),
        steps: Collections.TestResultSteps.find({testResultRoleId: testResultRoleId}, {sort: {order: 1}}).fetch()
      };

      // load the result
      result.result = Collections.TestResults.findOne(result.role.testResultId);

      // load the test system, test agent, and server
      result.system = Collections.TestSystems.findOne({staticId: result.role.testSystemId, projectVersionId: result.role.projectVersionId});
      result.agent  = Collections.TestAgents.findOne({staticId: result.role.testAgentId, projectVersionId: result.role.projectVersionId});
      result.server = Collections.Servers.findOne({staticId: result.result.serverId, projectVersionId: result.role.projectVersionId});

      return result;
    },

    /**
     * Signal the failure of a test result role
     * Abort the other roles (if any) and exit
     * @param testResultRoleId
     */
    testRoleFailed: function (testResultRoleId, result) {
      Meteor.log.info("testRoleFailed: " + testResultRoleId + ", " + result);
      check(Meteor.user(), Object);
      check(testResultRoleId, String);
      var testResultRole = Collections.TestResultRoles.findOne({_id: testResultRoleId});
      if(testResultRole && testResultRole.testResultId){
        Collections.TestResultRoles.update({_id: testResultRoleId}, {$set:{
          status: TestResultStatus.complete,
          resultCode: TestResultCodes.fail,
          result: result
        }});

        // Mark the result as a failure
        Collections.TestResults.update({
          _id: testResultRole.testResultId,
          status: {$ne: TestResultStatus.complete}
        }, {
          $set: {
            status: TestResultStatus.complete,
            resultCode: TestResultCodes.fail,
            result: result
          }
        });

        // Abort all other roles for this test (unless they've already error'd out)
        Collections.TestResultRoles.update({
          testResultId: testResultRole.testResultId,
          status: {$ne: TestResultStatus.complete},
          _id: {$ne: testResultRoleId}
        }, {
          $set: {
            abort: true,
            status: TestResultStatus.complete,
            resultCode: TestResultCodes.abort,
            result: result
          }
        }, {multi: true});
      } else {
        throw new Meteor.error("unknown-test-result-role", "Failed to find testResultRole with _id " + testResultRoleId);
      }
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
      var testResultRole = Collections.TestResultRoles.findOne();
      if(testResultRole){
        Collections.TestResultRoles.update({_id: testResultRoleId}, {$set:{status: status}});

        // update the test result status with the highest ranking status
        if(testResultRole.testResult().status < status){
          Collections.TestResults.update({_id: testResultRole.testResultId}, {$set: {status: status}});
        }
      }
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
      Collections.TestResultSteps.update({_id: testResultStepId}, {$set:{status: status}});
    },

    /**
     * Set the result code of a testResultRole record
     * @param testResultRoleId
     * @param code
     */
    setTestResultRoleResult: function (testResultRoleId, code, resultData) {
      check(Meteor.user(), Object);
      check(testResultRoleId, String);
      check(code, Number);
      var testResultRole = Collections.TestResultRoles.findOne({_id: testResultRoleId});
      Collections.TestResultRoles.update({_id: testResultRoleId}, {$set:{resultCode: code, result: resultData}});
      if(code == TestResultCodes.fail){
        Collections.TestResults.update({_id: testResultRole.testResultId}, {$set:{resultCode: code, result: resultData}});
      } else if(testResultRole.testResult().resultCode == null) {
        Collections.TestResults.update({_id: testResultRole.testResultId}, {$set:{resultCode: code}});
      } else if(code !== TestResultCodes.pass) {
        Collections.TestResults.update({_id: testResultRole.testResultId}, {$set:{resultCode: code}});
      }
    },

    /**
     * Set the result code of a testResultStep record
     * @param testResultStepId
     * @param code
     */
    setTestResultStepResult: function (testResultStepId, code, resultData) {
      check(Meteor.user(), Object);
      check(testResultStepId, String);
      check(code, Number);
      Collections.TestResultSteps.update({_id: testResultStepId}, {$set:{resultCode: code, result: resultData}});
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
        Collections.TestResultSteps.update({_id: testResultStepId}, {$set:{checks: checks}});
      }
    },

    /**
     * Save the context for a screenshot
     * @param screenshotId
     * @param context
     */
    saveScreenshotContext: function (screenshotId, context) {
      check(Meteor.user(), Object);
      check(screenshotId, String);
      check(context, Object);
      Collections.Screenshots.update(screenshotId, {$set: context});
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
      var destination = Collections.Nodes.findOne({staticId: destinationId, projectVersionId: projectVersionId}),
        source, route;

      if(sourceId){
        source = Collections.Nodes.findOne({staticId: sourceId, projectVersionId: projectVersionId});
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
      var roles = Collections.TestCaseRoles.find({
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
      Collections.TestCases.remove({_id: testCase._id});
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
      Collections.TestCaseSteps.remove({ testCaseRoleId: role._id });

      // Delete the role
      Collections.TestCaseRoles.remove({_id: role._id});
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

      var testCase = Collections.TestCases.findOne(testCaseId);

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

      var testCase = Collections.TestCases.findOne(testCaseId);

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
     * Launch a test result run
     */
    launchTestResult: function (testResultId) {
      check(Meteor.user(), Object);
      check(testResultId, String);
      Meteor.log.info("launchTestResult: " + testResultId);

      var testResult = Collections.TestResults.findOne(testResultId);

      // validate user permissions

      if(testResult){
        testResult.launch();
      } else {
        throw new Meteor.Error("invalid-testResult", "launchTestResult failed because the result could not be found", testResultId);
      }
    },

    /**
     * Run a quick comparison of two screenshots
     * @param baseScreenshotId
     * @param compareScreenshotId
     */
    templateCompareScreenshots: function (baseScreenshotId, compareScreenshotId, forceUpdate) {
      console.log("templateCompareScreenshots:", baseScreenshotId, compareScreenshotId);
      check(Meteor.user(), Object);
      check(baseScreenshotId, String);
      check(compareScreenshotId, String);

      // check for an cached comparison
      var comparison = Collections.ScreenshotComparisons.findOne({baseScreenshot: baseScreenshotId, compareScreenshot: compareScreenshotId});
      if(comparison){
        // check for project permissions

        if(forceUpdate){
          Collections.ScreenshotComparisons.remove(comparison._id);
        } else {
          return comparison;
        }
      }

      // grab the screenshots
      var baseScreenshot = Collections.Screenshots.findOne(baseScreenshotId),
        comparisonScreenshot = Collections.Screenshots.findOne(compareScreenshotId);

      check(baseScreenshot, FS.File);
      check(comparisonScreenshot, FS.File);

      // check project permissions

      if(baseScreenshot.hasStored("screenshots") && comparisonScreenshot.hasStored("screenshots")){
        var basePath = FS.basePath + "screenshots/" + baseScreenshot.getCopyInfo("screenshots").key,
          comparisonPath = FS.basePath + "screenshots/" + comparisonScreenshot.getCopyInfo("screenshots").key,
          command = "template_align.py " + basePath + " " + comparisonPath,
          logFile = "template_align_" + baseScreenshotId + "_" + compareScreenshotId + ".log";

        ProcessLauncher.launchImageTask(command, logFile, Meteor.bindEnvironment(function (output) {
          try {
            var result = JSON.parse(output);
          } catch (e) {
            Meteor.log.debug("templateCompareScreenshots JSON parse failed: \n" + output + "\n");
            throw new Meteor.Error("templateCompareScreenshots failed: result could not be parsed, " + e.toString());
          }

          Collections.ScreenshotComparisons.insert({projectId: baseScreenshot.projectId, baseScreenshot: baseScreenshotId, compareScreenshot: compareScreenshotId, result: result});
        }));
      } else {
        throw new Meteor.Error("templateCompareScreenshots failed: one or more screenshots could not be found");
      }
    }
  });
});
