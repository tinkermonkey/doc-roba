import {Meteor} from 'meteor/meteor';
import {Auth} from '../../_lib/auth.js';
import {Actions} from '../action.js';

Meteor.publish("actions", function (projectId, projectVersionId) {
  console.debug("Publish: actions");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return Actions.find({projectVersionId: projectVersionId});
  }
  console.warn("Publish: actions returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});
