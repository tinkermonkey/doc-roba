import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { Auth } from '../auth.js';
import { Util } from '../util.js';
import { ChangeTracker } from '../change_tracker/change_tracker.js';
import { NodeTypes } from './node_types.js';
import { NodeChecks } from './node_check.js';
import { NodeCheckTypes } from './node_check_types.js';
import { UrlParameter } from './url_parameter.js';
import { DatastoreCategories } from '../datastore/datastore_catagories.js';
import { CodeModules } from '../code_module/code_module.js';
import { Datastores } from '../datastore/datastore.js';
import { DatastoreRows } from '../datastore/datastore_row.js';
import { PlatformConfigurations } from '../platform_configuration/platform_configuration.js';
import { PlatformOperatingSystems } from '../platform_configuration/platform_operating_system.js';
import { PlatformViewports } from '../platform_configuration/platform_viewport.js';
import { Projects } from '../project/project.js';
import { ProjectVersions } from '../project/project_version.js';
import { PlatformTypes } from '../platform_type/platform_types.js';
import { WebPlatformType } from '../../platform_types/web/web.js';

/**
 * Documentation tree nodes
 */
export const Node  = new SimpleSchema({
  // Static ID field that will be constant across versions of the project node structure
  staticId        : {
    type      : String,
    index     : true,
    autoValue : SchemaHelpers.autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this node belongs
  projectId       : {
    type      : String,
    denyUpdate: true
  },
  // Link to the project version to which this node belongs
  projectVersionId: {
    type      : String,
    index     : true,
    denyUpdate: true
  },
  // Link to the parent node's staticId
  parentId        : {
    type    : String,
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
  userTypeId      : {
    type    : String,
    optional: true,
    custom() {
      // Required for all non-root nodes
      var requiresUserType = _.contains([ NodeTypes.navMenu, NodeTypes.page, NodeTypes.view, NodeTypes.platform ], this.field("type").value);
      console.log("requiresUserType: ", requiresUserType, this.field("type").value, this.isSet, this.field("userTypeId"));
      if (requiresUserType && !this.field("userTypeId").isSet) {
        return "required";
      }
    }
  },
  // Platform id
  platformId      : {
    type    : String,
    optional: true,
    custom() {
      // Required for all non-root nodes
      var requiresPlatform = _.contains([ NodeTypes.navMenu, NodeTypes.page, NodeTypes.view ], this.field("type").value);
      if (requiresPlatform && !this.isSet) {
        return "required";
      }
    }
  },
  // Document title, does not need to be unique
  title           : {
    type: String
  },
  // Local url for this page
  url             : {
    type    : String,
    optional: true
  },
  // Any url parameters which identify this page
  urlParameters   : {
    type    : [ UrlParameter ],
    optional: true
  },
  // Page title, from the page itself
  pageTitle       : {
    type    : String,
    optional: true
  },
  // A black box for type-specific configuration
  config          : {
    type        : Object,
    blackbox    : true,
    defaultValue: {}
  },
  // Bind to the static Type constant
  type            : {
    type         : Number,
    allowedValues: _.values(NodeTypes)
  },
  // Code that determines when the node is ready
  readyCode       : {
    type    : String,
    optional: true
  },
  // Code that validates the node
  validationCode  : {
    type    : String,
    optional: true
  },
  // Links to the staticIds of navigation menu nodes found on this page
  navMenus        : {
    type    : [ String ],
    optional: true
  },
  // Standard tracking fields
  dateCreated     : {
    type      : Date,
    autoValue : SchemaHelpers.autoValueDateCreated,
    denyUpdate: true
  },
  createdBy       : {
    type      : String,
    autoValue : SchemaHelpers.autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified    : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy      : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});
export const Nodes = new Mongo.Collection("nodes");
Nodes.attachSchema(Node);
Nodes.deny(Auth.ruleSets.deny.ifNotTester);
Nodes.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(Nodes, "nodes");
SchemaHelpers.autoUpdateOrder(Nodes, [ "urlParameters" ]);

if (Meteor.isServer) {
  /**
   * Create a code module for userType nodes
   * @param node
   * @returns String CodeModule._id
   */
  Nodes.createCodeModule = function (node) {
    console.log("Nodes.createCodeModule:", node);
    return CodeModules.insert({
      name                : Util.wordsToCamel(node.title),
      projectId           : node.projectId,
      projectVersionId    : node.projectVersionId,
      parentId            : node.staticId,
      parentCollectionName: 'Nodes',
      language            : node.project().automationLanguage,
      docs                : 'Code Module for the user type ' + node.title,
      modifiedBy          : node.createdBy,
      createdBy           : node.createdBy
    });
  };
  
  /**
   * Create a datastore for userType nodes
   * @param node
   * @returns String Datastore._id
   */
  Nodes.createDatastore = function (node) {
    console.log("Nodes.createDatastore:", node);
    return Datastores.insert({
      title               : node.title + " Users",
      projectId           : node.projectId,
      projectVersionId    : node.projectVersionId,
      parentId            : node.staticId,
      parentCollectionName: 'Nodes',
      category            : DatastoreCategories.userType,
      modifiedBy          : node.createdBy,
      createdBy           : node.createdBy
    });
  };
  
  /**
   * Create a PlatformConfiguration for platform nodes
   * @param node
   * @returns String PlatformConfiguration._id
   */
  Nodes.createPlatformConfiguration = function (node) {
    console.log("Nodes.createPlatformConfiguration:", node);
    return PlatformConfigurations.insert({
      projectId       : node.projectId,
      projectVersionId: node.projectVersionId,
      parentId        : node.staticId,
      modifiedBy      : node.createdBy,
      createdBy       : node.createdBy
    });
  };
  
  /**
   * Observe changes to the nodes to automatically pick up user type changes
   * Synchronize the changes to the data store representing that type
   */
  Nodes.after.insert(function (userId, node) {
    if (node.type === NodeTypes.userType) {
      // Create a new code module for this user type
      Nodes.createCodeModule(node);
      
      // Create a new data store for users of this type
      Nodes.createDatastore(node);
    } else if (node.type === NodeTypes.platform) {
      // Create a platform configuration
      Nodes.createPlatformConfiguration(node);
    }
  });
  Nodes.after.update(function (userId, node, changedFields) {
    if (node.type === NodeTypes.userType) {
      if (_.contains(changedFields, "title")) {
        // update the data store title
        Datastores.update({
          projectVersionId: node.projectVersionId,
          parentId        : node.staticId
        }, { $set: { title: node.title + " Users" } });
        CodeModules.update({
          projectVersionId: node.projectVersionId,
          parentId        : node.staticId
        }, { $set: { name: Util.wordsToCamel(node.title) } });
      }
    }
  });
  Nodes.after.remove(function (userId, node) {
    if (node.type === NodeTypes.userType) {
      // update the data store title
      Datastores.update({
        projectVersionId: node.projectVersionId,
        parentId        : node.staticId
      }, { $set: { deleted: true } });
      CodeModules.update({
        projectVersionId: node.projectVersionId,
        parentId        : node.staticId
      }, { $set: { deleted: true } });
    } else if (node.type === NodeTypes.platform) {
      // TODO: evaluate deleting platform configuration
      
    }
  });
}

/**
 * Helpers
 */
Nodes.helpers({
  /**
   * Get the project record for this node
   * @return Project
   */
  project(){
    return Projects.findOne({ _id: this.projectId });
  },
  
  /**
   * Get the project version record for this node
   * @return ProjectVersion
   */
  projectVersion(){
    return ProjectVersions.findOne({ _id: this.projectVersionId });
  },
  
  /**
   * Get the parent node record for this node
   * @return Node
   */
  parent() {
    if (this.parentId) {
      return Nodes.findOne({ staticId: this.parentId, projectVersionId: this.projectVersionId });
    } else if (this.type == NodeTypes.root) {
      // No parent to return
    } else {
      throw new Meteor.Error("parent_not_found", "No parent found for node", JSON.stringify(this));
    }
  },
  
  /**
   * Get the platform record for this node
   * @return Node
   */
  platform() {
    if (this.platformId) {
      return Nodes.findOne({ staticId: this.platformId, projectVersionId: this.projectVersionId });
    } else if (this.type == NodeTypes.platform) {
      return this;
    } else {
      throw new Meteor.Error("platform_not_found", "No platform found for node", JSON.stringify(this));
    }
  },
  
  /**
   * Get the list of platforms for this node's userType
   * @return [Node]
   */
  platforms() {
    return Nodes.find({ parentId: this.userType().staticId, projectVersionId: this.projectVersionId });
  },
  
  /**
   * Get the user type record for this node
   * @return Node
   */
  userType() {
    if (this.userTypeId) {
      return Nodes.findOne({ staticId: this.userTypeId, projectVersionId: this.projectVersionId });
    } else if (this.type == NodeTypes.userType) {
      return this;
    } else {
      throw new Meteor.Error("user_type_not_found", "No user type found for node", JSON.stringify(this));
    }
  },
  
  /**
   * Get the platform type object for this node
   * @return PlatformType
   */
  platformType(){
    let platform = this.platform();
    if (platform) {
      switch (parseInt(platform.config.type)) {
        case PlatformTypes.web:
          return WebPlatformType;
        default:
          console.error("Nodes.platformType unknown platform type:", platform);
      }
    }
  },
  
  /**
   * Get the nodes which are entrypoints for this node's platform
   * @return [Node]
   */
  platformEntryPoints(){
    let platform = this.platform();
    if (platform) {
      return Nodes.find({ parentId: platform.staticId, projectVersionId: platform.projectVersionId });
    }
  },
  
  /**
   * Get the configuration for this node's platform
   * @return PlatformConfiguration
   */
  platformConfig(){
    let node           = this,
        platformConfig = PlatformConfigurations.findOne({
          projectVersionId: node.projectVersionId,
          parentId        : node.platform().staticId
        });
    
    if (platformConfig) {
      return platformConfig;
    } else {
      let platformConfigId;
      
      if (Meteor.isServer) {
        platformConfigId = Nodes.createPlatformConfiguration(node);
      } else {
        platformConfigId = Meteor.call("createPlatformConfiguration", node.projectId, node.projectVersionId, node.staticId);
      }
      return PlatformConfigurations.findOne({ _id: platformConfigId });
    }
  },
  
  /**
   * Get the operating systems for this node's platform
   * @return [PlatformViewport]
   */
  platformOperatingSystems(){
    let platform = this.platform();
    if (platform) {
      return PlatformOperatingSystems.find({
        parentId        : platform.staticId,
        projectVersionId: platform.projectVersionId
      }, { sort: { title: 1 } });
    }
  },
  
  /**
   * Get the viewports for this node's platform
   * @return [PlatformViewport]
   */
  platformViewports(){
    let platform = this.platform();
    if (platform) {
      return PlatformViewports.find({
        parentId        : platform.staticId,
        projectVersionId: platform.projectVersionId
      }, { sort: { title: 1 } });
    }
  },
  
  /**
   * Get an account record from the DatastoreRow collection for this node's usertype
   * @return DatastoreRow
   */
  getAccount(filter) {
    let dataStore           = this.userType().dataStore();
    filter                  = filter || {};
    filter.dataStoreId      = dataStore.staticId;
    filter.projectVersionId = dataStore.projectVersionId;
    return DatastoreRows.findOne(filter, { sort: { dateCreated: 1 } });
  },
  
  /**
   * Get the code module for this node's usertype
   * @return CodeModule
   */
  codeModule () {
    let node       = this,
        codeModule = CodeModules.findOne({
          projectVersionId: node.projectVersionId,
          parentId        : node.userType().staticId
        });
    
    if (codeModule) {
      return codeModule;
    } else {
      let codeModuleId;
      
      if (Meteor.isServer) {
        codeModuleId = Nodes.createCodeModule(node);
      } else {
        codeModuleId = Meteor.call("createUserTypeCodeModule", node.projectId, node.projectVersionId, node.staticId);
      }
      return CodeModules.findOne({ _id: codeModuleId });
    }
  },
  
  /**
   * Get the credentials Datastore for this node's usertype
   * @return Datastore
   */
  dataStore () {
    let node      = this,
        dataStore = Datastores.findOne({
          projectVersionId: node.projectVersionId,
          parentId        : node.userType().staticId
        });
    
    if (dataStore) {
      return dataStore;
    } else {
      let dataStoreId;
      
      if (Meteor.isServer) {
        dataStoreId = Nodes.createDatastore(node);
      } else {
        dataStoreId = Meteor.call("createUserTypeDatastore", node.projectId, node.projectVersionId, node.staticId);
      }
      return Datastores.findOne({ _id: dataStoreId });
    }
  },
  
  /**
   * Get the Ready NodeChecks for this node
   * @return [NodeCheck]
   */
  readyChecks () {
    return NodeChecks.find({
      parentId        : this.staticId,
      projectVersionId: this.projectVersionId,
      type            : NodeCheckTypes.ready
    }, { sort: { order: 1 } })
  },
  
  /**
   * Get the Valid NodeChecks for this node
   * @return [NodeCheck]
   */
  validChecks () {
    return NodeChecks.find({
      parentId        : this.staticId,
      projectVersionId: this.projectVersionId,
      type            : NodeCheckTypes.valid
    }, { sort: { order: 1 } })
  },
  
  /**
   * Insert a NodeCheck for this node
   */
  addCheck (checkType, checkFn, selector, checkFnArgs, callback) {
    let node       = this,
        checkCount = NodeChecks.find({
          parentId        : node.staticId,
          projectVersionId: node.projectVersionId,
          type            : checkType
        }).count();
    NodeChecks.insert({
      projectId       : node.projectId,
      projectVersionId: node.projectVersionId,
      parentId        : node.staticId,
      type            : checkType,
      checkFn         : checkFn,
      checkFnArgs     : checkFnArgs,
      selector        : selector,
      order           : checkCount
    }, callback);
  }
});

