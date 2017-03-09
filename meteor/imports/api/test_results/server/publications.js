import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {TestResults} from '../test_results.js';
import {TestResultRoles} from '../test_result_roles.js';
import {TestResultSteps} from '../test_result_steps.js';

Meteor.publish("test_case_results", function (projectId, testCaseId, limit) {
  console.debug("Publish: test_case_results:", testCaseId, limit);
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && testCaseId){
    limit = limit || 10;
    var options = {sort: { dateCreated: -1 }};
    if(limit > 0){
      options.limit = limit;
    }
    return TestResults.find({
      testCaseId: testCaseId
    }, options);
  }
  return [];
});

Meteor.publish("test_result", function (projectId, testResultId) {
  console.debug("Publish: test_result:", projectId, testResultId);
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId)){
    return TestResults.find(testResultId);
  }
  return [];
});

Meteor.publish("test_result_roles", function (projectId, testResultId) {
  console.debug("Publish: test_result_roles:", projectId, testResultId);
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId)){
    return TestResultRoles.find({testResultId: testResultId});
  }
  return [];
});

Meteor.publish("test_result_steps", function (projectId, testResultId) {
  console.debug("Publish: test_result_steps:", projectId, testResultId);
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId)){
    return TestResultSteps.find({testResultId: testResultId});
  }
  return [];
});

Meteor.publish("test_run_result", function (testResultId) {
  console.debug("Publish: test_run_result:", testResultId);
  // check that there is a project role for the current user
  if(this.userId){
    return TestResults.find(testResultId);
  }
  return [];
});
