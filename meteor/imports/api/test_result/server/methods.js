import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Collections
import {TestResults} from '../test_result.js';
import {TestResultRoles} from '../test_result_role.js';
import {TestResultSteps} from '../test_result_step.js';
import {TestAgents} from '../../test_agent/test_agent.js';
import {TestSystems} from '../../test_system/test_system.js';
import {TestServers} from '../../test_server/test_server.js';

// Enums
import {TestResultStatus} from '../test_result_status.js';
import {TestResultCodes} from '../test_result_codes.js';
import {TestCaseStepTypes} from '../../test_case/test_case_step_types.js';
import {ScreenshotKeys} from '../../screenshot/screenshot_keys.js';

Meteor.methods({
  /**
   * Return the TestResultStatus enum to a client
   * @returns Object
   */
  loadTestEnums() {
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
  loadTestRoleManifest(testResultRoleId) {
    console.debug("loadTestRoleManifest: ", testResultRoleId);
    check(Meteor.user(), Object);
    check(testResultRoleId, String);
    
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
    result.server = TestServers.findOne({staticId: result.result.serverId, projectVersionId: result.role.projectVersionId});
    
    return result;
  },
  
  /**
   * Signal the failure of a test result role
   * Abort the other roles (if any) and exit
   * @param testResultRoleId
   * @param result
   */
  testRoleFailed(testResultRoleId, result) {
    console.info("testRoleFailed: " + testResultRoleId + ", " + result);
    check(Meteor.user(), Object);
    check(testResultRoleId, String);
    
    var testResultRole = TestResultRoles.findOne({_id: testResultRoleId});
    if(testResultRole && testResultRole.testResultId){
      TestResultRoles.update({_id: testResultRoleId}, {$set:{
        status: TestResultStatus.complete,
        resultCode: TestResultCodes.fail,
        result: result
      }});
      
      // Mark the result as a failure
      TestResults.update({
        _id: testResultRole.testResultId,
        status: {$ne: TestResultStatus.complete}
      }, {
        $set: {
          status: TestResultStatus.complete,
          resultCode: TestResultCodes.fail,
          result: result
        }
      });
      
      // Abort all other roles for this test (unless they`ve already error`d out)
      TestResultRoles.update({
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
  setTestResultRoleStatus(testResultRoleId, status) {
    check(Meteor.user(), Object);
    check(testResultRoleId, String);
    check(status, Number);
    
    var testResultRole = TestResultRoles.findOne();
    if(testResultRole){
      TestResultRoles.update({_id: testResultRoleId}, {$set:{status: status}});
      
      // update the test result status with the highest ranking status
      if(testResultRole.testResult().status < status){
        TestResults.update({_id: testResultRole.testResultId}, {$set: {status: status}});
      }
    }
  },
  
  /**
   * Set the status of a testResultStep record
   * @param testResultStepId
   * @param status
   */
  setTestResultStepStatus(testResultStepId, status) {
    check(Meteor.user(), Object);
    check(testResultStepId, String);
    check(status, Number);
    
    TestResultSteps.update({_id: testResultStepId}, {$set:{status: status}});
  },
  
  /**
   * Set the result code of a testResultRole record
   * @param testResultRoleId
   * @param code
   * @param resultData
   */
  setTestResultRoleResult(testResultRoleId, code, resultData) {
    check(Meteor.user(), Object);
    check(testResultRoleId, String);
    check(code, Number);
    
    var testResultRole = TestResultRoles.findOne({_id: testResultRoleId});
    TestResultRoles.update({_id: testResultRoleId}, {$set:{resultCode: code, result: resultData}});
    if(code == TestResultCodes.fail){
      TestResults.update({_id: testResultRole.testResultId}, {$set:{resultCode: code, result: resultData}});
    } else if(testResultRole.testResult().resultCode == null) {
      TestResults.update({_id: testResultRole.testResultId}, {$set:{resultCode: code}});
    } else if(code !== TestResultCodes.pass) {
      TestResults.update({_id: testResultRole.testResultId}, {$set:{resultCode: code}});
    }
  },
  
  /**
   * Set the result code of a testResultStep record
   * @param testResultStepId
   * @param code
   * @param resultData
   */
  setTestResultStepResult(testResultStepId, code, resultData) {
    check(Meteor.user(), Object);
    check(testResultStepId, String);
    check(code, Number);
    
    TestResultSteps.update({_id: testResultStepId}, {$set:{resultCode: code, result: resultData}});
  },
  
  /**
   * Save a check for done during a test
   * @param testResultStepId
   * @param checks
   */
  saveTestResultStepChecks(testResultStepId, checks) {
    check(Meteor.user(), Object);
    check(testResultStepId, String);
    
    if(checks){
      TestResultSteps.update({_id: testResultStepId}, {$set:{checks: checks}});
    }
  },
  
  /**
   * Launch a test result run
   */
  launchTestResult(testResultId) {
    check(Meteor.user(), Object);
    check(testResultId, String);
    console.info("launchTestResult: " + testResultId);
    
    var testResult = TestResults.findOne(testResultId);
    
    // validate user permissions
    
    if(testResult){
      testResult.launch();
    } else {
      throw new Meteor.Error("invalid-testResult", "launchTestResult failed because the result could not be found", testResultId);
    }
  },
});
