import { Meteor } from 'meteor/meteor';
import { Auth } from '../../auth.js';
import { Actions } from '../actions.js';

Meteor.publish("actions", function (projectId, projectVersionId) {
  console.debug("Publish: actions");
  if (Auth.hasProjectAccess(this.userId, projectId) && projectVersionId) {
    return Actions.find({ projectId: projectId, projectVersionId: projectVersionId });
  }
  console.warn("Publish: actions returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});

Meteor.publish("action", function (projectId, projectVersionId, actionId) {
  console.debug("Publish: action");
  if (Auth.hasProjectAccess(this.userId, projectId) && projectVersionId) {
    return Actions.find({
      projectId       : projectId,
      projectVersionId: projectVersionId,
      $or             : [
        { _id: actionId },
        { staticId: actionId }
      ]
    });
  }
  console.warn("Publish: action returning nothing for [" + projectId + "], [" + projectVersionId + "], [" + actionId + "], " + this.userId);
  return [];
});
