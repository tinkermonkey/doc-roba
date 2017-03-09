import { Meteor } from 'meteor/meteor';
import { Auth } from '../../auth.js';
import { Nodes } from '../nodes.js';
import { NodeChecks } from '../node_check.js';
import { NodeTypes } from '../node_types.js';

Meteor.publish("nodes", function (projectId, projectVersionId) {
  console.debug("Publish: nodes", projectId, projectVersionId);
  if (Auth.hasProjectAccess(this.userId, projectId) && projectVersionId) {
    return Nodes.find({ projectId: projectId, projectVersionId: projectVersionId });
  }
  console.warn("Publish: nodes returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});

Meteor.publish("node", function (projectId, projectVersionId, nodeId) {
  console.debug("Publish: node", projectId, projectVersionId, nodeId);
  if (Auth.hasProjectAccess(this.userId, projectId) && projectVersionId) {
    return Nodes.find({
      projectId       : projectId,
      projectVersionId: projectVersionId,
      $or             : [
        { _id: nodeId },
        { staticId: nodeId }
      ]
    });
  }
  console.warn("Publish: node returning nothing for [" + projectId + "], [" + projectVersionId + "], [" + nodeId + "], " + this.userId);
  return [];
});

Meteor.publish("user_types", function (projectId, projectVersionId) {
  console.debug("Publish: user_types", projectId, projectVersionId);
  if (Auth.hasProjectAccess(this.userId, projectId) && projectVersionId) {
    return Nodes.find({ projectId: projectId, projectVersionId: projectVersionId, type: NodeTypes.userType });
  }
  return [];
});

Meteor.publish("platforms", function (projectId, projectVersionId) {
  console.debug("Publish: platforms", projectId, projectVersionId);
  if (Auth.hasProjectAccess(this.userId, projectId) && projectVersionId) {
    return Nodes.find({ projectId: projectId, projectVersionId: projectVersionId, type: NodeTypes.platform });
  }
  return [];
});

Meteor.publish("node_checks", function (projectId, projectVersionId, staticId, type) {
  console.debug("Publish: node_checks", projectId, projectVersionId, staticId, type);
  if (Auth.hasProjectAccess(this.userId, projectId) && projectVersionId) {
    if (type != null) {
      return NodeChecks.find({
        projectId       : projectId,
        projectVersionId: projectVersionId,
        parentId        : staticId,
        type            : type
      });
    } else {
      return NodeChecks.find({ projectId: projectId, projectVersionId: projectVersionId, parentId: staticId });
    }
  }
  console.warn("Publish: node_checks returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});

Meteor.publish("all_node_checks", function (projectId, projectVersionId) {
  console.debug("Publish: all_node_checks", projectId, projectVersionId);
  if (Auth.hasProjectAccess(this.userId, projectId) && projectVersionId) {
    return NodeChecks.find({ projectId: projectId, projectVersionId: projectVersionId });
  }
  console.warn("Publish: all_node_checks returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});
