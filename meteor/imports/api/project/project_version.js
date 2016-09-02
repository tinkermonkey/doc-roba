import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {NodeTypes} from '../node/node_types.js';

import {CodeModules} from '../code_module/code_module.js';
import {Datastores} from '../datastore/datastore.js';
import {DatastoreCategories} from '../datastore/datastore_catagories.js';
import {DatastoreDataTypes} from '../datastore/datastore_data_type.js';
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

if(Meteor.isServer) {
  /**
   * Create a code module for this project version
   * @param projectVersion
   * @returns {*}
   */
  ProjectVersions.createCodeModule = function (projectVersion) {
    return CodeModules.insert({
      name: Util.wordsToCamel(projectVersion.project().title),
      projectId: projectVersion.projectId,
      projectVersionId: projectVersion._id,
      parentId: projectVersion._id,
      parentCollectionName: 'Nodes',
      language: projectVersion.project().automationLanguage,
      docs: 'Code Module for the project ' + projectVersion.project().title,
      modifiedBy: projectVersion.createdBy,
      createdBy: projectVersion.createdBy
    });
  };
  
  /**
   * Create a datastore for this project version server config data
   * @param projectVersion
   * @returns {*}
   */
  ProjectVersions.createServerConfigDatastore = function (projectVersion) {
    return Datastores.insert({
      title: projectVersion.project().title + " Server Config",
      projectId: projectVersion.projectId,
      projectVersionId: projectVersion._id,
      parentId: projectVersion._id,
      parentCollectionName: 'Nodes',
      category: DatastoreCategories.serverConfig,
      modifiedBy: projectVersion.createdBy,
      createdBy: projectVersion.createdBy
    });
  };
  
  /**
   * Observe changes to the nodes to automatically pick up user type changes
   * Synchronize the changes to the data store representing that type
   */
  ProjectVersions.after.insert(function (userId, projectVersion) {
    // Create a new code module for this project version
    ProjectVersions.createCodeModule(projectVersion);
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
  project () {
    return Projects.findOne(this.projectId)
  },
  userTypes () {
    return Nodes.find({projectVersionId: this._id, type: NodeTypes.userType}, {sort: {title: 1}});
  },
  dataTypes(){
    DatastoreDataTypes.find({projectVersionId: this._id}, {sort: {title: 1}});
  },
  codeModule () {
    let projectVersion = this,
        codeModule = CodeModules.findOne({projectVersionId: projectVersion._id, parentId: projectVersion._id});
    if(codeModule){
      return codeModule;
    } else {
      let codeModuleId;
      if(Meteor.isServer) {
        codeModuleId = ProjectVersions.createCodeModule(projectVersion);
      } else {
        codeModuleId = Meteor.call("createVersionCodeModule", projectVersion.projectId, projectVersion._id);
      }
      return CodeModules.findOne({_id: codeModuleId});
    }
  },
  checkCodeModules () {
    // Make sure there is a code module for each user type
    this.userTypes().codeModule();
    
    // Make sure this is
  },
  serverConfigDatastore () {
    let projectVersion = this,
        dataStore = Datastores.findOne({projectVersionId: projectVersion._id, parentId: projectVersion._id, category: DatastoreCategories.serverConfig});
    if(dataStore){
      return dataStore;
    } else {
      let dataStoreId;
    
      if(Meteor.isServer) {
        dataStoreId = ProjectVersions.createServerConfigDatastore(projectVersion);
      } else {
        dataStoreId = Meteor.call("createVersionServerConfigDatastore", projectVersion.projectId, projectVersion._id);
      }
      return Datastores.findOne({_id: dataStoreId});
    }
  }
});