import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {Nodes} from '../node.js';
import {NodeChecks} from '../node_check.js';
import {NodeTypes} from '../node_types.js';

Meteor.publish("nodes", function (projectId, projectVersionId) {
  console.debug("Publish: nodes");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return Nodes.find({projectId: projectId, projectVersionId: projectVersionId});
  }
  console.warn("Publish: nodes returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});

Meteor.publish("node", function (projectId, projectVersionId, nodeId) {
  console.debug("Publish: node");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return Nodes.find({projectId: projectId, projectVersionId: projectVersionId, staticId: nodeId});
  }
  console.warn("Publish: node returning nothing for [" + projectId + "], [" + projectVersionId+ "], [" + nodeId + "], " + this.userId);
  return [];
});

Meteor.publish("user_types", function (projectId, projectVersionId) {
  console.debug("Publish: user_types");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return Nodes.find({projectId: projectId, projectVersionId: projectVersionId, type: NodeTypes.userType});
  }
  return [];
});

Meteor.publish("platforms", function (projectId, projectVersionId) {
  console.debug("Publish: platforms");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return Nodes.find({projectId: projectId, projectVersionId: projectVersionId, type: NodeTypes.platform});
  }
  return [];
});

Meteor.publish("node_checks", function (projectId, projectVersionId, nodeId) {
  console.debug("Publish: node_checks");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return NodeChecks.find({projectId: projectId, projectVersionId: projectVersionId, parentId: nodeId});
  }
  console.warn("Publish: node_checks returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});

Meteor.publish("all_node_checks", function (projectId, projectVersionId) {
  console.debug("Publish: all_node_checks");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return NodeChecks.find({projectId: projectId, projectVersionId: projectVersionId});
  }
  console.warn("Publish: all_node_checks returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});
