import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {TestCases} from '../test_case.js';
import {TestCaseRoles} from '../test_case_role.js';
import {TestCaseSteps} from '../test_case_step.js';
import {TestGroups} from '../test_group.js';

Meteor.publish("test_groups", function (projectId, projectVersionId) {
  console.debug("Publish: test_groups");
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestGroups.find({projectVersionId: projectVersionId});
  }
  return [];
});

Meteor.publish("test_cases", function (projectId, projectVersionId) {
  console.debug("Publish: test_cases");
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestCases.find({projectVersionId: projectVersionId});
  }
  return [];
});

Meteor.publish("test_case", function (projectId, projectVersionId, testCaseId) {
  console.debug("Publish: test_case");
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestCases.find({projectVersionId: projectVersionId, staticId: testCaseId});
  }
  return [];
});

Meteor.publish("test_case_roles", function (projectId, projectVersionId, testCaseId) {
  console.debug("Publish: test_cases");
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestCaseRoles.find({projectVersionId: projectVersionId, testCaseId: testCaseId});
  }
  return [];
});

Meteor.publish("test_case_steps", function (projectId, projectVersionId, testCaseId) {
  console.debug("Publish: test_cases");
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestCaseSteps.find({projectVersionId: projectVersionId, testCaseId: testCaseId});
  }
  return [];
});
