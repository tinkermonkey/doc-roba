import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {Actions} from '../action.js';

Meteor.publish("actions", function (projectId, projectVersionId) {
  console.debug("Publish: actions");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return Actions.find({projectId: projectId, projectVersionId: projectVersionId});
  }
  console.warn("Publish: actions returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});

Meteor.publish("action", function (projectId, projectVersionId, actionId) {
  console.debug("Publish: action");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return Actions.find({projectId: projectId, projectVersionId: projectVersionId, staticId: actionId});
  }
  console.warn("Publish: action returning nothing for [" + projectId + "], [" + projectVersionId + "], [" + actionId + "], " + this.userId);
  return [];
});
