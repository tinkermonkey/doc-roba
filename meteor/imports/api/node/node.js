import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {Util} from '../util.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {NodeTypes} from './node_types.js';

import {UrlParameter} from './url_parameter.js';
import {DatastoreCategories} from '../datastore/datastore_catagories.js';

import {CodeModules} from '../code_module/code_module.js';
import {Datastores} from '../datastore/datastore.js';
import {DatastoreRows} from '../datastore/datastore_row.js';
import {Projects} from '../project/project.js';
import {ProjectVersions} from '../project/project_version.js';

/**
 * Documentation tree nodes
 */
export const Node = new SimpleSchema({
  // Static ID field that will be constant across versions of the project node structure
  staticId: {
    type: String,
    index: true,
    autoValue: SchemaHelpers.autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this node belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this node belongs
  projectVersionId: {
    type: String,
    index: true,
    denyUpdate: true
  },
  // Link to the parent node's staticId
  parentId: {
    type: String,
    optional: true,
    custom() {
      // Required for all non-root nodes
      var isRoot = this.field('type').value === NodeTypes.root;
      if (!isRoot && !this.field('type').isSet && (!this.operator || (this.value === null || this.value === ""))) {
        return "required";
      }
    }
  },
  // user type id
  userTypeId: {
    type: String,
    optional: true,
    custom() {
      // Required for all non-root nodes
      var requiresUserType = _.contains([NodeTypes.navMenu, NodeTypes.page, NodeTypes.view, NodeTypes.platform], this.field("type").value);
      console.log("requiresUserType: ", requiresUserType, this.field("type").value, this.isSet, this.field("userTypeId"));
      if (requiresUserType && !this.field("userTypeId").isSet) {
        return "required";
      }
    }
  },
  // Platform id
  platformId: {
    type: String,
    optional: true,
    custom() {
      // Required for all non-root nodes
      var requiresPlatform = _.contains([NodeTypes.navMenu, NodeTypes.page, NodeTypes.view], this.field("type").value);
      if (requiresPlatform && !this.isSet) {
        return "required";
      }
    }
  },
  // Keep track of the platform entry points
  isEntry: {
    type: Boolean,
    defaultValue: false
  },
  // Keep track of the platform exit points
  isExit: {
    type: Boolean,
    defaultValue: false
  },
  // Document title, does not need to be unique
  title: {
    type: String
  },
  // Local url for this page
  url: {
    type: String,
    optional: true
  },
  // Any url parameters which identify this page
  urlParameters: {
    type: [UrlParameter],
    optional: true
  },
  // Page title, from the page itself
  pageTitle: {
    type: String,
    optional: true
  },
  // A black box for type-specific configuration
  config: {
    type: Object,
    blackbox: true,
    defaultValue: {}
  },
  // Bind to the static Type constant
  type: {
    type: Number,
    allowedValues: _.values(NodeTypes)
  },
  // Code that determines when the node is ready
  readyCode: {
    type: String,
    optional: true
  },
  // Code that validates the node
  validationCode: {
    type: String,
    optional: true
  },
  // Links to the staticIds of navigation menu nodes found on this page
  navMenus: {
    type: [String],
    optional: true
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
export const Nodes = new Mongo.Collection("nodes");
Nodes.attachSchema(Node);
Nodes.deny(Auth.ruleSets.deny.ifNotTester);
Nodes.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(Nodes, "nodes");
SchemaHelpers.autoUpdateOrder(Nodes, ["urlParameters"]);

if(Meteor.isServer) {
  /**
   * Create a code module for userType nodes
   * @param projectVersion
   * @param userId
   * @returns {*}
   */
  Nodes.createCodeModule = function (node) {
    console.log("Nodes.createCodeModule:", node);
    return CodeModules.insert({
      name: Util.wordsToCamel(node.title),
      projectId: node.projectId,
      projectVersionId: node.projectVersionId,
      parentId: node.staticId,
      parentCollectionName: 'Nodes',
      language: node.project().automationLanguage,
      docs: 'Code Module for the user type ' + node.title,
      modifiedBy: node.createdBy,
      createdBy: node.createdBy
    });
  };
  
  /**
   * Create a datastore for userType nodes
   * @param node
   * @param userId
   * @returns {*}
   */
  Nodes.createDatastore = function (node) {
    return Datastores.insert({
      title: node.title + " Users",
      projectId: node.projectId,
      projectVersionId: node.projectVersionId,
      parentId: node.staticId,
      parentCollectionName: 'Nodes',
      category: DatastoreCategories.userType,
      modifiedBy: node.createdBy,
      createdBy: node.createdBy
    });
  };
  
  /**
   * Observe changes to the nodes to automatically pick up user type changes
   * Synchronize the changes to the data store representing that type
   */
  Nodes.after.insert(function (userId, node) {
    if(node.type === NodeTypes.userType) {
      // Create a new code module for this user type
      Nodes.createCodeModule(node);
      
      // Create a new data store for users of this type
      Nodes.createDatastore(node);
    }
  });
  Nodes.after.update(function (userId, node, changedFields) {
    if(node.type === NodeTypes.userType) {
      if(_.contains(changedFields, "title")){
        // update the data store title
        Datastores.update({projectVersionId: node.projectVersionId, parentId: node.staticId}, {$set: {title: node.title + " Users"}});
        CodeModules.update({projectVersionId: node.projectVersionId, parentId: node.staticId}, {$set: {name: Util.wordsToCamel(node.title)}});
      }
    }
  });
  Nodes.after.remove(function (userId, node) {
    if(node.type === NodeTypes.userType) {
      // update the data store title
      Datastores.update({projectVersionId: node.projectVersionId, parentId: node.staticId}, {$set: {deleted: true}});
      CodeModules.update({projectVersionId: node.projectVersionId, parentId: node.staticId}, {$set: {deleted: true}});
    }
  });
}

/**
 * Helpers
 */
Nodes.helpers({
  project(){
    return Projects.findOne({_id: this.projectId});
  },
  projectVersion(){
    return ProjectVersions.findOne({_id: this.projectVersionId});
  },
  platform() {
    return Nodes.findOne({staticId: this.platformId, projectVersionId: this.projectVersionId});
  },
  userType() {
    if(this.userTypeId){
      return Nodes.findOne({staticId: this.userTypeId, projectVersionId: this.projectVersionId});
    } else if(this.type == NodeTypes.userType){
      return this;
    } else {
      throw new Meteor.Error("user_type_not_found", "No user type found for node", JSON.stringify(this));
    }
  },
  getAccount(filter) {
    let dataStore = this.userType().dataStore();
    filter = filter || {};
    filter.dataStoreId = dataStore.staticId;
    filter.projectVersionId = dataStore.projectVersionId;
    return DatastoreRows.findOne(filter, {sort: {dateCreated: 1}});
  },
  codeModule () {
    let node = this;
    if(node.type == NodeTypes.userType) {
      let codeModule = CodeModules.findOne({projectVersionId: node.projectVersionId, parentId: node.staticId});
      if(codeModule){
        return codeModule;
      } else {
        let codeModuleId;
        
        if(Meteor.isServer) {
          codeModuleId = Nodes.createCodeModule(node);
        } else {
          codeModuleId = Meteor.call("createUserTypeCodeModule", node.projectId, node.projectVersionId, node.staticId);
        }
        return CodeModules.findOne({_id: codeModuleId});
      }
    }
  },
  dataStore () {
    let node = this;
    if(node.type == NodeTypes.userType) {
      let dataStore = Datastores.findOne({projectVersionId: node.projectVersionId, parentId: node.staticId});
      if(dataStore){
        return dataStore;
      } else {
        let dataStoreId;
  
        if(Meteor.isServer) {
          dataStoreId = Nodes.createDatastore(node);
        } else {
          dataStoreId = Meteor.call("createUserTypeDatastore", node.projectId, node.projectVersionId, node.staticId);
        }
        return Datastores.findOne({_id: dataStoreId});
      }
    }
  }
});

