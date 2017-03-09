import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {TestSystems} from '../test_system.js';

Meteor.publish("test_systems", function (projectId, projectVersionId) {
  console.debug("Publish: test_systems");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestSystems.find({projectVersionId: projectVersionId});
  }
  return [];
});

Meteor.publish("test_system", function (projectId, projectVersionId, testSystemId) {
  console.debug("Publish: test_system");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestSystems.find({projectVersionId: projectVersionId, staticId: testSystemId});
  }
  return [];
});
