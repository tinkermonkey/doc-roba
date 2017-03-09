import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Auth } from '../auth.js';
import { ChangeTracker } from '../change_tracker/change_tracker.js';
import { SchemaHelpers } from '../schema_helpers.js';
import { NodeCheckTypes } from './node_check_types.js';
import { NodeReadyCheckFns } from './node_ready_check_fns.js';
import { NodeValidCheckFns } from './node_valid_check_fns.js';

/**
 * ============================================================================
 * NodeCheck
 * ============================================================================
 */
export const NodeCheck = new SimpleSchema({
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
    type      : String,
    denyUpdate: true
  },
  // Check type
  type            : {
    type         : Number,
    allowedValues: _.values(NodeCheckTypes)
  },
  // The key from NodeReadyCheckFns or NodeReadyCheckFns
  checkFn         : {
    type         : String,
    allowedValues: _.keys(NodeReadyCheckFns).concat(_.keys(NodeValidCheckFns)),
    optional     : true
  },
  checkFnArgs     : {
    type    : [ String ],
    optional: true
  },
  // Check selector
  selector        : {
    type    : String,
    optional: true
  },
  // Sort order
  order           : {
    type: Number
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

export const NodeChecks = new Mongo.Collection("node_checks");
NodeChecks.attachSchema(NodeCheck);
NodeChecks.deny(Auth.ruleSets.deny.ifNotTester);
NodeChecks.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(NodeChecks, "node_checks");

/**
 * Helpers
 */
NodeChecks.helpers({});