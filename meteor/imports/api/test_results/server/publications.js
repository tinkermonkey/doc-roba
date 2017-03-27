import { Meteor } from 'meteor/meteor';
import { Auth } from '../../auth.js';
import { TestResults } from '../test_results.js';
import { TestResultRoles } from '../test_result_roles.js';
import { TestResultSteps } from '../test_result_steps.js';
import { TestResultStepWaits } from '../test_result_step_waits.js';

Meteor.publish("test_case_results", function (projectId, testCaseId, limit) {
  console.debug("Publish: test_case_results:", testCaseId, limit);
  // check that there is a project role for the current user
  if (Auth.hasProjectAccess(this.userId, projectId) && testCaseId) {
    limit       = limit || 10;
    let options = { sort: { dateCreated: -1 } };
    if (limit > 0) {
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
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return TestResults.find(testResultId);
  }
  return [];
});

Meteor.publish("test_result_roles", function (projectId, testResultId) {
  console.debug("Publish: test_result_roles:", projectId, testResultId);
  // check that there is a project role for the current user
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return TestResultRoles.find({ testResultId: testResultId });
  }
  return [];
});

Meteor.publish("test_result_steps", function (projectId, testResultId) {
  console.debug("Publish: test_result_steps:", projectId, testResultId);
  // check that there is a project role for the current user
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return TestResultSteps.find({ testResultId: testResultId });
  }
  return [];
});

Meteor.publish("test_result_step_wait", function (projectId, testResultId, waitId) {
  console.debug("Publish: test_result_step_wait:", projectId, testResultId, waitId);
  // check that there is a project role for the current user
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return TestResultStepWaits.find({ testResultId: testResultId, waitId: waitId });
  }
  return [];
});

Meteor.publish("test_result_step_waits", function (projectId, testResultId) {
  console.debug("Publish: test_result_step_waits:", projectId, testResultId);
  // check that there is a project role for the current user
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return TestResultStepWaits.find({ testResultId: testResultId });
  }
  return [];
});
