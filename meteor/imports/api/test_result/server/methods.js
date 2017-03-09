import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
// Collections
import { LogMessages } from '../../log_message/log_message.js';
import { Nodes } from '../../nodes/nodes.js';
import { PlatformViewports } from '../../platform_configuration/platform_viewport.js';
import { Screenshots } from '../../screenshot/screenshot.js';
import { TestResults } from '../test_result.js';
import { TestResultRoles } from '../test_result_role.js';
import { TestResultSteps } from '../test_result_step.js';
import { TestAgents } from '../../test_agent/test_agent.js';
import { TestSystems } from '../../test_system/test_system.js';
import { TestServers } from '../../test_server/test_server.js';
// Enums
import { TestResultStatus } from '../test_result_status.js';
import { TestResultCodes } from '../test_result_codes.js';
import { TestCaseStepTypes } from '../../test_case/test_case_step_types.js';
import { ScreenshotKeys } from '../../screenshot/screenshot_keys.js';
import { ProcessLauncher } from '../../process_launcher/process_launcher.js';

Meteor.methods({
  /**
   * Return the TestResultStatus enum to a client
   * @returns Object
   */
  loadTestEnums() {
    check(Meteor.userId(), String);
    
    return {
      resultStatus  : TestResultStatus,
      resultCodes   : TestResultCodes,
      stepTypes     : TestCaseStepTypes,
      screenshotKeys: ScreenshotKeys
    };
  },
  
  /**
   * Load the context for a test role execution
   * @param testResultRoleId
   */
  loadTestRoleManifest(testResultRoleId) {
    console.debug("loadTestRoleManifest: ", testResultRoleId);
    check(Meteor.userId(), String);
    check(testResultRoleId, String);
    
    // Require authentication
    if (!this.userId) {
      throw new Meteor.Error("Authentication Failed", "User is not authenticated");
    }
    
    // load the role and the steps
    var result = {
      role : TestResultRoles.findOne(testResultRoleId),
      steps: TestResultSteps.find({ testResultRoleId: testResultRoleId }, { sort: { order: 1 } }).fetch()
    };
    
    // load the result
    result.result = TestResults.findOne(result.role.testResultId);
    
    // load the test system, test agent, and server
    result.system   = TestSystems.findOne({
      staticId        : result.role.testSystemId,
      projectVersionId: result.role.projectVersionId
    });
    result.agent    = TestAgents.findOne({
      staticId        : result.role.testAgentId,
      projectVersionId: result.role.projectVersionId
    });
    result.server   = TestServers.findOne({
      staticId        : result.result.serverId,
      projectVersionId: result.role.projectVersionId
    });
    
    if(result.steps && result.steps.length){
      var nodeFound = false,
          i = 0;
      while(!nodeFound && i < result.steps.length){
        var step = result.steps[0];
        if(step.node){
          //
          var node = Nodes.findOne(step.node._id);
          if(node){
            var platformConfig = node.platformConfig();
            result.viewport = PlatformViewports.findOne({platformId: platformConfig._id, default: true});
          }
        }
        i++;
      }
    }
    
    return result;
  },
  
  /**
   * Signal the failure of a test result role
   * Abort the other roles (if any) and exit
   * @param testResultRoleId
   * @param result
   */
  testRoleFailed(testResultRoleId, result) {
    console.info("testRoleFailed: ", testResultRoleId, ", ", result);
    check(Meteor.userId(), String);
    check(testResultRoleId, String);
    
    var testResultRole = TestResultRoles.findOne({ _id: testResultRoleId });
    if (testResultRole && testResultRole.testResultId) {
      TestResultRoles.update({ _id: testResultRoleId }, {
        $set: {
          status    : TestResultStatus.complete,
          resultCode: TestResultCodes.fail,
          result    : result
        }
      });
      
      // Mark the result as a failure
      TestResults.update({
        _id   : testResultRole.testResultId,
        status: { $ne: TestResultStatus.complete }
      }, {
        $set: {
          status    : TestResultStatus.complete,
          resultCode: TestResultCodes.fail,
          result    : result
        }
      });
      
      // Abort all other roles for this test (unless they`ve already error`d out)
      TestResultRoles.update({
        testResultId: testResultRole.testResultId,
        status      : { $ne: TestResultStatus.complete },
        _id         : { $ne: testResultRoleId }
      }, {
        $set: {
          abort     : true,
          status    : TestResultStatus.complete,
          resultCode: TestResultCodes.abort,
          result    : result
        }
      }, { multi: true });
    } else {
      throw new Meteor.error("unknown-test-result-role", "Failed to find testResultRole with _id " + testResultRoleId);
    }
  },
  
  /**
   * Set the status of a testResultRole record
   * @param testResultRoleId
   * @param status
   */
  setTestResultRoleStatus(testResultRoleId, status) {
    check(Meteor.userId(), String);
    check(testResultRoleId, String);
    check(status, Number);
    
    var testResultRole = TestResultRoles.findOne(),
        testResult     = testResultRole.testResult();
    if (testResultRole) {
      TestResultRoles.update({ _id: testResultRoleId }, { $set: { status: status } });
      
      // update the test result status with the highest ranking status
      if (testResult && testResult.status < status) {
        TestResults.update({ _id: testResultRole.testResultId }, { $set: { status: status } });
      }
    }
  },
  
  /**
   * Set the status of a testResultStep record
   * @param testResultStepId
   * @param status
   */
  setTestResultStepStatus(testResultStepId, status) {
    check(Meteor.userId(), String);
    check(testResultStepId, String);
    check(status, Number);
    
    TestResultSteps.update({ _id: testResultStepId }, { $set: { status: status } });
  },
  
  /**
   * Set the result code of a testResultRole record
   * @param testResultRoleId
   * @param code
   * @param resultData
   */
  setTestResultRoleResult(testResultRoleId, code, resultData) {
    check(Meteor.userId(), String);
    check(testResultRoleId, String);
    check(code, Number);
    
    var testResultRole = TestResultRoles.findOne({ _id: testResultRoleId });
    TestResultRoles.update({ _id: testResultRoleId }, { $set: { resultCode: code, result: resultData } });
    if (code == TestResultCodes.fail) {
      TestResults.update({ _id: testResultRole.testResultId }, { $set: { resultCode: code, result: resultData } });
    } else if (testResultRole.testResult().resultCode == null) {
      TestResults.update({ _id: testResultRole.testResultId }, { $set: { resultCode: code } });
    } else if (code !== TestResultCodes.pass) {
      TestResults.update({ _id: testResultRole.testResultId }, { $set: { resultCode: code } });
    }
  },
  
  /**
   * Set the result code of a testResultStep record
   * @param testResultStepId
   * @param code
   * @param resultData
   */
  setTestResultStepResult(testResultStepId, code, resultData) {
    check(Meteor.userId(), String);
    check(testResultStepId, String);
    check(code, Number);
    
    TestResultSteps.update({ _id: testResultStepId }, { $set: { resultCode: code, result: resultData } });
  },
  
  /**
   * Save a check for done during a test
   * @param testResultStepId
   * @param checks
   */
  saveTestResultStepChecks(testResultStepId, checks) {
    check(Meteor.userId(), String);
    check(testResultStepId, String);
    
    if (checks) {
      TestResultSteps.update({ _id: testResultStepId }, { $set: { checks: checks } });
    }
  },
  
  /**
   * Launch a test result run
   */
  launchTestResult(testResultId) {
    console.info("launchTestResult: ", testResultId);
    check(Meteor.userId(), String);
    check(testResultId, String);
    
    var testResult = TestResults.findOne(testResultId);
    
    // validate user permissions
    if (testResult) {
      // do some quick cleanup in case this is a re-run
      LogMessages.remove({ "context.testResultId": testResult._id });
      Screenshots.remove({ testResultId: testResult._id });
      
      TestResults.update({ _id: testResult._id }, {
        $set  : { status: TestResultStatus.launched, abort: false },
        $unset: { resultCode: "", result: "" }
      });
      
      TestResultRoles.update({ testResultId: testResult._id }, {
        $set  : { status: TestResultStatus.staged },
        $unset: { resultCode: "", result: "", pid: "" }
      }, { multi: true });
      
      TestResultSteps.update({ testResultId: testResult._id }, {
        $set  : { status: TestResultStatus.staged },
        $unset: { resultCode: "", result: "", checks: "" }
      }, { multi: true });
      
      // get the list of roles, create a launch token and fire away
      TestResultRoles.find({ testResultId: testResult._id }).forEach(function (role) {
        console.info("launchTestResult launching role: ", role._id);
        var token   = Accounts.singleUseAuth.generate({ expires: { seconds: 30 } }),
            command = [ ProcessLauncher.testRoleScript, "--roleId", role._id, "--token", token ].join(" "),
            logFile = [ "test_result_role_", role._id, ".log" ].join(""),
            proc    = ProcessLauncher.launchAutomation(command, logFile);
        
        TestResultRoles.update(role._id, { $set: { pid: proc.pid, status: TestResultStatus.launched } });
        console.info("launchTestResult launched: ", role._id, " as ", proc.pid, " > ", logFile);
      });
    } else {
      throw new Meteor.Error("invalid-testResult", "launchTestResult failed because the result could not be found", testResultId);
    }
  },
  
  /**
   * Delete a test result and all of the data
   * @param testResultId
   */
  deleteTestResult(testResultId){
    console.info("deleteTestResult:", testResultId);
    check(Meteor.userId(), String);
    check(testResultId, String);
    
    // Load the record
    var testResult = TestResults.findOne(testResultId);
    
    if (testResult) {
      LogMessages.remove({ "context.testResultId": testResult._id });
      Screenshots.remove({ testResultId: testResult._id });
      TestResultRoles.remove({ testResultId: testResult._id });
      TestResults.remove({ _id: testResult._id })
    } else {
      console.warn('deleteTestResult: test result not found for id', testResultId);
    }
  }
});
