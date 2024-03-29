import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { Auth } from '../../auth.js';
// Collections
import { LogMessages } from '../../log_messages/log_messages.js';
import { Screenshots } from '../../screenshots/screenshots.js';
import { TestResults } from '../test_results.js';
import { TestResultRoles } from '../test_result_roles.js';
import { TestResultSteps } from '../test_result_steps.js';
import { TestResultStepWaits } from '../test_result_step_waits.js';
// Enums
import { TestResultStatus } from '../test_result_status.js';
import { TestResultCodes } from '../test_result_codes.js';
import { ProcessLauncher } from '../../process_launcher/process_launcher.js';

Meteor.methods({
  /**
   * Launch a test result run
   */
  launchTestResult(projectId, testResultId) {
    console.info("launchTestResult: ", projectId, testResultId);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(testResultId, String);
    
    // Validate that the user has permission
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let testResult = TestResults.findOne({ projectId: projectId, _id: testResultId });
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
          let token   = Accounts.singleUseAuth.generate({ expires: { seconds: 30 } }),
              command = [ ProcessLauncher.testRoleScript, "--roleId", role._id, "--projectId", testResult.projectId, "--token", '"' + token + '"' ].join(" "),
              logFile = [ "test_result_role_", role._id, ".log" ].join(""),
              proc    = ProcessLauncher.launchAutomation(command, logFile, (exitCode) => {
                console.info("launchTestResult test role complete: " + proc.pid + ", " + exitCode);
                if (exitCode) {
                  Meteor.call('setTestResultRoleStatus', projectId, role._id, TestResultStatus.complete);
                  Meteor.call('setTestResultRoleResult', projectId, role._id, TestResultCodes.fail);
                }
              });
          
          TestResultRoles.update(role._id, {
            $set     : { pid: proc.pid, status: TestResultStatus.launched },
            $addToSet: { logFiles: ProcessLauncher.getFullLogPath(logFile) }
          });
          console.info("launchTestResult launched: ", role._id, " as ", proc.pid, " > ", logFile);
        });
      } else {
        throw new Meteor.Error("404", "Not found", "No TestResult found for id [" + testResultId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Load the context for a test role execution
   * @param projectId
   * @param testResultRoleId
   */
  loadTestRoleManifest(projectId, testResultRoleId) {
    console.debug("loadTestRoleManifest: ", projectId, testResultRoleId);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(testResultRoleId, String);
    
    // Validate that the user has permission
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      // load the role and the steps
      let testResultRole = TestResultRoles.findOne({ projectId: projectId, _id: testResultRoleId });
      if (testResultRole) {
        return testResultRole.manifest();
      } else {
        throw new Meteor.Error("404", "Not found", "No TestResultRole found for id [" + testResultRoleId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Signal the failure of a test result role
   * Abort the other roles (if any) and exit
   * @param projectId
   * @param testResultRoleId
   * @param result
   */
  testRoleFailed(projectId, testResultRoleId, result) {
    console.info("testRoleFailed: ", projectId, testResultRoleId, result);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(testResultRoleId, String);
    
    // Validate that the user has permission
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let testResultRole = TestResultRoles.findOne({ projectId: projectId, _id: testResultRoleId });
      if (testResultRole && testResultRole.testResultId) {
        console.debug("testRoleFailed Updating TestResultRole [" + testResultRole._id + "] with result code");
        TestResultRoles.update({ projectId: projectId, _id: testResultRole._id }, {
          $set: {
            status    : TestResultStatus.complete,
            resultCode: TestResultCodes.fail,
            result    : result
          }
        });
        
        // Mark the result as a failure
        console.debug("testRoleFailed Updating TestResult [" + testResultRole.testResultId + "] with result code");
        TestResults.update({
          projectId: projectId,
          _id      : testResultRole.testResultId,
          status   : { $ne: TestResultStatus.complete }
        }, {
          $set: {
            status    : TestResultStatus.complete,
            resultCode: TestResultCodes.fail,
            result    : result
          }
        });
        
        // Abort all other roles for this test (unless they`ve already error`d out)
        console.debug("testRoleFailed Updating incomplete TestResultRoles for result [" + testResultRole.testResultId + "] with result code");
        TestResultRoles.update({
          projectId   : projectId,
          testResultId: testResultRole.testResultId,
          status      : { $ne: TestResultStatus.complete },
          _id         : { $ne: testResultRole._id }
        }, {
          $set: {
            abort     : true,
            status    : TestResultStatus.complete,
            resultCode: TestResultCodes.abort,
            result    : result
          }
        }, { multi: true });
      } else {
        throw new Meteor.Error("404", "Not found", "No TestResultRole found for id [" + testResultRoleId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Set the status of a TestResultRole record
   * @param projectId
   * @param testResultRoleId
   * @param status
   */
  setTestResultRoleStatus(projectId, testResultRoleId, status) {
    console.debug("setTestResultRoleStatus: ", projectId, testResultRoleId, status);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(testResultRoleId, String);
    check(status, Number);
    
    // Validate that the user has permission
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      // load the role and the steps
      let testResultRole = TestResultRoles.findOne({ projectId: projectId, _id: testResultRoleId });
      if (testResultRole) {
        let testResult = testResultRole.testResult();
        TestResultRoles.update({ projectId: projectId, _id: testResultRole._id }, { $set: { status: status } });
        
        // update the test result status with the highest ranking status
        console.debug('setTestResultRoleStatus checking testResult status:', status, testResult.status);
        if (testResult && status > testResult.status) {
          console.debug('setTestResultRoleStatus updating testResult status:', status);
          TestResults.update({ projectId: projectId, _id: testResultRole.testResultId }, { $set: { status: status } });
        }
      } else {
        throw new Meteor.Error("404", "Not found", "No TestResultRole found for id [" + testResultRoleId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Set the status of a TestResultStep record
   * @param projectId
   * @param testResultStepId
   * @param status
   */
  setTestResultStepStatus(projectId, testResultStepId, status) {
    console.debug("setTestResultStepStatus: ", projectId, testResultStepId, status);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(testResultStepId, String);
    check(status, Number);
    
    // Validate that the user has permission
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let updateCount = TestResultSteps.update({ projectId: projectId, _id: testResultStepId }, { $set: { status: status } });
      if (!updateCount) {
        throw new Meteor.Error("404", "Not found", "No TestResultStep found for id [" + testResultStepId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Set the result code of a TestResultRoles record
   * @param projectId
   * @param testResultRoleId
   * @param code
   * @param resultData
   */
  setTestResultRoleResult(projectId, testResultRoleId, code, resultData) {
    console.debug("setTestResultRoleResult: ", projectId, testResultRoleId, code);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(testResultRoleId, String);
    check(code, Number);
    
    // Validate that the user has permission
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let testResultRole = TestResultRoles.findOne({ projectId: projectId, _id: testResultRoleId });
      if (testResultRole) {
        TestResultRoles.update({ projectId: projectId, _id: testResultRoleId }, { $set: { resultCode: code, result: resultData } });
        if (code == TestResultCodes.fail) {
          TestResults.update({ projectId: projectId, _id: testResultRole.testResultId }, {
            $set: {
              resultCode: code,
              result    : resultData
            }
          });
        } else if (testResultRole.testResult().resultCode == null) {
          TestResults.update({ projectId: projectId, _id: testResultRole.testResultId }, { $set: { resultCode: code } });
        } else if (code !== TestResultCodes.pass) {
          TestResults.update({ projectId: projectId, _id: testResultRole.testResultId }, { $set: { resultCode: code } });
        }
        
      } else {
        throw new Meteor.Error("404", "Not found", "No TestResultStep found for id [" + testResultRoleId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Add a log file or folder which contains log files to the role
   * @param projectId
   * @param testResultRoleId
   * @param path
   */
  addTestResultRoleLog(projectId, testResultRoleId, path) {
    console.debug("addTestResultRoleLog: ", projectId, testResultRoleId, path);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(testResultRoleId, String);
    check(path, String);
    
    // Validate that the user has permission
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let updateCount = TestResultRoles.update({
        projectId: projectId,
        _id      : testResultRoleId
      }, {
        $addToSet: {
          logFiles: path
        }
      });
      if (!updateCount) {
        throw new Meteor.Error("404", "Not found", "No TestResultRole found for id [" + testResultRoleId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Set the result code of a testResultStep record
   * @param projectId
   * @param testResultStepId
   * @param code
   * @param resultData
   */
  setTestResultStepResult(projectId, testResultStepId, code, resultData) {
    console.debug("setTestResultStepResult: ", projectId, testResultStepId, code);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(testResultStepId, String);
    check(code, Number);
    
    // Validate that the user has permission
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let updateCount = TestResultSteps.update({ projectId: projectId, _id: testResultStepId }, {
        $set: {
          resultCode: code,
          result    : resultData
        }
      });
      if (!updateCount) {
        throw new Meteor.Error("404", "Not found", "No TestResultStep found for id [" + testResultStepId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Save a check for done during a test
   * @param projectId
   * @param testResultStepId
   * @param checks
   */
  saveTestResultStepChecks(projectId, testResultStepId, checks) {
    console.debug("saveTestResultStepChecks: ", projectId, testResultStepId, checks);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(testResultStepId, String);
    
    // Validate that the user has permission
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let updateCount = TestResultSteps.update({ projectId: projectId, _id: testResultStepId }, { $set: { checks: checks } });
      if (!updateCount) {
        throw new Meteor.Error("404", "Not found", "No TestResultStep found for id [" + testResultStepId + "] and project [" + projectId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
    }
  },
  
  /**
   * Check in a role as present for a wait step in a test
   * @param projectId
   * @param testResultId
   * @param waitId
   * @param testResultRoleId
   */
  checkInForWaitStep(projectId, testResultId, waitId, testResultRoleId){
    console.debug("checkInForWaitStep: ", projectId, testResultId, waitId, testResultRoleId);
    check(Meteor.userId(), String);
    check(projectId, String);
    check(testResultId, String);
    check(waitId, String);
    check(testResultRoleId, String);
    
    // Validate that the user has permission
    if (Auth.hasProjectAccess(Meteor.userId(), projectId)) {
      let update         = { $set: {}, $addToSet: {} },
          waitRecord     = TestResultStepWaits.findOne({ projectId: projectId, testResultId: testResultId, waitId: waitId }),
          checkedInRoles = waitRecord.checkedInRoleIds || [];
      
      // Check this role in
      update.$addToSet.checkedInRoleIds = testResultRoleId;
      update.$addToSet.checkedInTimes   = { testResultRoleId: testResultRoleId, time: Date.now() };
      
      // Check to see if this is the last person
      checkedInRoles.push(testResultRoleId);
      update.$set.everyoneArrived = waitRecord.awaitingRoleIds.reduce((arrived, roleId) => {
        return arrived && _.contains(checkedInRoles, roleId)
      }, true);
      
      // Check in this role
      console.debug('Updating wait step:', update);
      let updateCount = TestResultStepWaits.update(waitRecord._id, update);
      if (!updateCount) {
        throw new Meteor.Error("404", "Not found", "No TestResultStepWaits found for waitId [" + waitId + "] and testResult [" + testResultId + "]");
      }
    } else {
      throw new Meteor.Error("403", "Not authorized", "No project access for user [" + Meteor.userId() + "] and project [" + projectId + "]");
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
    let testResult  = TestResults.findOne(testResultId),
        roleResults = testResult.roleResults().fetch();
    
    if (testResult) {
      LogMessages.remove({ "context.testResultId": testResult._id });
      Screenshots.remove({ testResultId: testResult._id });
      TestResultRoles.remove({ testResultId: testResult._id });
      TestResults.remove({ _id: testResult._id });
      
      // Delete the log files for the roles
      roleResults.forEach((roleResult) => {
        roleResult.logFiles.forEach((logFilePath) => {
          // Remove the files or folders
          ProcessLauncher.removeLogPath(logFilePath);
        });
      });
    } else {
      console.warn('deleteTestResult: test result not found for id', testResultId);
    }
  }
});
