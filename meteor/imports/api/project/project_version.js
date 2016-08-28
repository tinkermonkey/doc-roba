import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {NodeTypes} from '../node/node_types.js';

import {CodeModules} from '../code_module/code_module.js';
import {Nodes} from '../node/node.js';
import {Projects} from './project.js';

/**
 * User Project Versions
 */
export const ProjectVersion = new SimpleSchema({
  projectId: {
    type: String,
    denyUpdate: true
  },
  version: {
    type: String
  },
  active: {
    type: Boolean,
    defaultValue: true
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});
export const ProjectVersions = new Mongo.Collection("project_versions");
ProjectVersions.attachSchema(ProjectVersion);
ProjectVersions.deny({
  insert: Auth.denyAlways,
  update: function (userId, doc) {
    var user = Meteor.users.findOne(userId);
    if(userId && user && doc && doc._id){
      return !user.hasAdminAccess(doc._id);
    }
    return true;
  },
  remove: Auth.denyAlways,
  fetch: ['projectId']
});
ProjectVersions.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(ProjectVersions, "project_versions");

/**
 * Observe changes to the nodes to automatically pick up user type changes
 * Synchronize the changes to the data store representing that type
 */
if(Meteor.isServer) {
  ProjectVersions.after.insert(function (userId, projectVersion) {
      
    // Create a new code module for this project version
    let codeModule = CodeModules.insert({
      name: Util.wordsToCamel(projectVersion.project().title),
      projectId: projectVersion.projectId,
      projectVersionId: projectVersion.projectVersionId,
      parentId: projectVersion.staticId,
      parentCollectionName: 'Nodes',
      language: projectVersion.project().automationLanguage,
      docs: 'Code Module for the project ' + projectVersion.project().title,
      modifiedBy: projectVersion.modifiedBy,
      createdBy: projectVersion.createdBy
    });
  });
  ProjectVersions.after.update(function (userId, projectVersion, changedFields) {
    if(_.contains(changedFields, "title")){
      // update the code module title
      CodeModules.update({projectVersionId: node.projectVersionId, parentId: node.staticId}, {$set: {name: Util.wordsToCamel(node.title)}});
    }
  });
}
/**
 * Helpers
 */
ProjectVersions.helpers({
  project: function () {
    return Projects.findOne(this.projectId)
  },
  userTypes: function () {
    return Nodes.find({projectVersionId: this._id, type: NodeTypes.userType}, {sort: {title: 1}});
  }
});