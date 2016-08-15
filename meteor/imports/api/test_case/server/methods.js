import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {TestCases} from '../test_case.js';
import {TestCaseRoles} from '../test_case_role.js';
import {TestCaseSteps} from '../test_case_step.js';

Meteor.methods({
  /**
   * Delete a test case
   * @param testCase
   */
  deleteTestCase(testCase) {
    console.debug("deleteTestCase: " + testCase._id);
    check(Meteor.user(), Object);
    check(testCase, Object);
    check(testCase.projectId, String);
    check(testCase.projectVersionId, String);
    check(testCase._id, String);
    
    // Delete the roles for this testCase
    var roles = TestCaseRoles.find({
      testCaseId: testCase.staticId,
      projectVersionId: testCase.projectVersionId
    }).fetch();
    _.each(roles, (role) => {
      Meteor.call("deleteTestCaseRole", role, (error) => {
        if(error){
          console.error("Failed to delete test case role: " + error.message);
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
  deleteTestCaseRole(role) {
    console.debug("deleteTestCaseRole: " + role._id);
    check(Meteor.user(), Object);
    check(role, Object);
    check(role._id, String);
    
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
  validateTestCaseRunConfig(testCaseId, config) {
    console.info("validateTestCaseRunConfig: " + testCaseId);
    check(Meteor.user(), Object);
    check(testCaseId, String);
    check(config, Object);
    
    var testCase = TestCases.findOne(testCaseId);
    
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
  prepareTestCaseRun(testCaseId, config) {
    console.info("prepareTestCaseRun: " + testCaseId);
    check(Meteor.user(), Object);
    check(testCaseId, String);
    check(config, Object);
    
    var testCase = TestCases.findOne(testCaseId);
    
    if(!testCase && testCase._id){
      throw new Meteor.Error("unknown-testCase", "A testCase with id [" + testCaseId + "] was not found");
    }
    
    // check that the config has data for all of the roles
    var testResultId = testCase.prepareTestResult(config);
    console.info("prepareTestCaseRun.testResultId: " + testResultId);
    return testResultId;
  },
});
