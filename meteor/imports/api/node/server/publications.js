import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {Nodes} from '../node.js';
import {NodeTypes} from '../node_types.js';

Meteor.publish("nodes", function (projectId, projectVersionId) {
  console.debug("Publish: nodes");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return Nodes.find({projectVersionId: projectVersionId});
  }
  console.warn("Publish: nodes returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});

Meteor.publish("user_types", function (projectId, projectVersionId) {
  console.debug("Publish: user_types");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return Nodes.find({projectVersionId: projectVersionId, type: NodeTypes.userType});
  }
  return [];
});

Meteor.publish("platforms", function (projectId, projectVersionId) {
  console.debug("Publish: platforms");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return Nodes.find({projectVersionId: projectVersionId, type: NodeTypes.platform});
  }
  return [];
});
