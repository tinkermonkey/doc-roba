import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { Auth } from '../auth.js';
import { Util } from '../util.js';
import { ChangeTracker } from '../change_tracker/change_tracker.js';
import { NodeTypes } from '../nodes/node_types.js';
import { CodeModules } from '../code_module/code_module.js';
import { Datastores } from '../datastore/datastore.js';
import { DatastoreCategories } from '../datastore/datastore_catagories.js';
import { DatastoreDataTypes } from '../datastore/datastore_data_type.js';
import { ProjectCodeModuleTypes } from './project_code_module_types.js';
import { Nodes } from '../nodes/nodes.js';
import { Projects } from './project.js';

/**
 * User Project Versions
 */
export const ProjectVersion  = new SimpleSchema({
  projectId   : {
    type      : String,
    denyUpdate: true
  },
  version     : {
    type: String
  },
  active      : {
    type        : Boolean,
    defaultValue: true
  },
  // Standard tracking fields
  dateCreated : {
    type      : Date,
    autoValue : SchemaHelpers.autoValueDateCreated,
    denyUpdate: true
  },
  createdBy   : {
    type      : String,
    autoValue : SchemaHelpers.autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy  : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});
export const ProjectVersions = new Mongo.Collection("project_versions");
ProjectVersions.attachSchema(ProjectVersion);
ProjectVersions.deny({
  insert: Auth.denyAlways,
  update(userId, doc) {
    var user = Meteor.users.findOne(userId);
    if (userId && user && doc && doc._id) {
      return !user.hasAdminAccess(doc._id);
    }
    return true;
  },
  remove: Auth.denyAlways,
  fetch : [ 'projectId' ]
});
ProjectVersions.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(ProjectVersions, "project_versions");

if (Meteor.isServer) {
  /**
   * Create a code module for this project version
   * @param projectVersion
   * @param type
   * @returns {*}
   */
  ProjectVersions.createCodeModule = function (projectVersion, type) {
    console.log("ProjectVersions.createCodeModule:", projectVersion._id, type);
    var name;
    switch (type) {
      case ProjectCodeModuleTypes.global:
        name = projectVersion.project().title;
        break;
      case ProjectCodeModuleTypes.test:
        name = "Test";
        break;
      default:
        console.error("ProjectVersions.createCodeModule requires a known type:", type);
        return;
    }
    return CodeModules.insert({
      name                : Util.wordsToCamel(name),
      projectId           : projectVersion.projectId,
      projectVersionId    : projectVersion._id,
      parentId            : projectVersion._id,
      parentCollectionName: 'ProjectVersions',
      type                : type,
      language            : projectVersion.project().automationLanguage,
      modifiedBy          : projectVersion.createdBy,
      createdBy           : projectVersion.createdBy
    });
  };
  
  /**
   * Create a datastore for this project version server config data
   * @param projectVersion
   * @returns {*}
   */
  ProjectVersions.createServerConfigDatastore = function (projectVersion) {
    return Datastores.insert({
      title               : projectVersion.project().title + " Server Config",
      projectId           : projectVersion.projectId,
      projectVersionId    : projectVersion._id,
      parentId            : projectVersion._id,
      parentCollectionName: 'ProjectVersions',
      category            : DatastoreCategories.serverConfig,
      modifiedBy          : projectVersion.createdBy,
      createdBy           : projectVersion.createdBy
    });
  };
  
  /**
   * Observe changes to the nodes to automatically pick up user type changes
   * Synchronize the changes to the data store representing that type
   */
  ProjectVersions.after.insert(function (userId, projectVersion) {
    // Create a new code module for this project version
    try {
      projectVersion.checkCodeModules();
    } catch (e) {
      console.error("ProjectVersions.after.insert: projectVersion.checkCodeModules failed,", e);
    }
  });
  ProjectVersions.after.update(function (userId, projectVersion, changedFields) {
    if (_.contains(changedFields, "title")) {
      // update the code module title
      CodeModules.update({
        projectVersionId: projectVersion._id,
        parentId        : projectVersion._id,
        type            : ProjectCodeModuleTypes.global
      }, {
        $set: {
          name: Util.wordsToCamel(projectVersion.title)
        }
      });
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
    return Nodes.find({ projectVersionId: this._id, type: NodeTypes.userType }, { sort: { title: 1 } });
  },
  platforms () {
    return Nodes.find({ projectVersionId: this._id, type: NodeTypes.platform }, { sort: { title: 1 } });
  },
  dataTypes(){
    DatastoreDataTypes.find({ projectVersionId: this._id }, { sort: { title: 1 } });
  },
  codeModule(type){
    if (type !== undefined) {
      let projectVersion = this,
          codeModule     = CodeModules.findOne({
            projectVersionId: projectVersion._id,
            parentId: projectVersion._id,
            type: type
          });
      if (codeModule) {
        return codeModule;
      } else {
        let codeModuleId;
        if (Meteor.isServer) {
          codeModuleId = ProjectVersions.createCodeModule(projectVersion, type);
        } else {
          codeModuleId = Meteor.call("createVersionCodeModule", projectVersion.projectId, projectVersion._id, type);
        }
        return CodeModules.findOne({ _id: codeModuleId });
      }
    } else {
      console.error("ProjectVersions.codeModule: type is required");
    }
  },
  globalCodeModule () {
    return this.codeModule(ProjectCodeModuleTypes.global)
  },
  testCodeModule () {
    return this.codeModule(ProjectCodeModuleTypes.test)
  },
  checkCodeModules () {
    console.log("ProjectVersions.checkCodeModules:", this._id);
    
    // Make sure there is a code module for each user type
    this.userTypes().forEach((userType) => {
      userType.codeModule()
    });
    
    // Make sure the project has the right code modules
    this.globalCodeModule();
    this.testCodeModule();
  },
  serverConfigDatastore () {
    let projectVersion = this,
        dataStore      = Datastores.findOne({
          projectVersionId: projectVersion._id,
          parentId: projectVersion._id,
          category: DatastoreCategories.serverConfig
        });
    if (dataStore) {
      return dataStore;
    } else {
      let dataStoreId;
      
      if (Meteor.isServer) {
        dataStoreId = ProjectVersions.createServerConfigDatastore(projectVersion);
      } else {
        dataStoreId = Meteor.call("createVersionServerConfigDatastore", projectVersion.projectId, projectVersion._id);
      }
      return Datastores.findOne({ _id: dataStoreId });
    }
  }
});