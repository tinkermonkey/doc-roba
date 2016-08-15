import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../_lib/schema_helpers.js';
import {Auth} from '../_lib/auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {NodeTypes} from './node_types.js';
import {UrlParameter} from './url_parameter.js';
import {DataStoreCategories} from '../datastore/datastore_catagories.js';
import {DataStores} from '../datastore/datastore.js';
import {DataStoreRows} from '../datastore/datastore_row.js';

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
    custom: function () {
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
    custom: function () {
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
    custom: function () {
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

/**
 * Observe changes to the nodes to automatically pick up user type changes
 * Synchronize the changes to the data store representing that type
 */
if(Meteor.isServer) {
  Nodes.after.insert(function (userId, node) {
    if(node.type === NodeTypes.userType) {
      // Create a new data store for users of this type
      DataStores.insert({
        title: node.title + " Users",
        dataKey: node._id,
        category: DataStoreCategories.userType,
        projectId: node.projectId,
        projectVersionId: node.projectVersionId,
        modifiedBy: node.modifiedBy,
        createdBy: node.createdBy
      });
    }
  });
  Nodes.after.update(function (userId, node, changedFields) {
    if(node.type === NodeTypes.userType) {
      if(_.contains(changedFields, "title")){
        // update the data store title
        DataStores.update({dataKey: node._id}, {$set: {title: node.title + " Users"}});
      }
    }
  });
  Nodes.after.remove(function (userId, node) {
    if(node.type === NodeTypes.userType) {
      // update the data store title
      DataStores.update({dataKey: node._id}, {$set: {deleted: true}});
    }
  });
}

/**
 * Helpers
 */
Nodes.helpers({
  platform: function () {
    if(this.platformId){
      return Nodes.findOne({staticId: this.platformId, projectVersionId: this.projectVersionId});
    }
  },
  userType: function () {
    if(this.userTypeId){
      return Nodes.findOne({staticId: this.userTypeId, projectVersionId: this.projectVersionId});
    }
  },
  getAccount: function () {
    if(this.userTypeId || this.type == NodeTypes.userType){
      var userTypeId = this.userTypeId || this._id,
        dataStore = DataStores.findOne({ dataKey: userTypeId });
      if(dataStore){
        return DataStoreRows.findOne({dataStoreId: dataStore._id}, {sort: {dateCreated: 1}});
      }
    }
  }
});

