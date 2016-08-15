import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {ActionVariable} from './action_variable.js';
import {ActionRoute} from './action_route.js';

/**
 * Automation actions
 */
export const Action = new SimpleSchema({
  // Create a static ID field that will be constant across versions
  // of the project node structure
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
    denyUpdate: true
  },
  // Document title, does not need to be unique
  title: {
    type: String
  },
  // Link to the static ID of the From node
  nodeId: {
    type: String
  },
  // Keep track of data requirements
  variables: {
    type: [ ActionVariable ],
    optional: true
  },
  // Store the decisions which lead to the various nodes
  routes: {
    type: [ ActionRoute ]
  },
  // The code to execute the action
  // Not really optional, but it needs to be nullable
  code: {
    type: String,
    defaultValue: "",
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
export const Actions = new Mongo.Collection("actions");
Actions.attachSchema(Action);
Actions.deny(Auth.ruleSets.deny.ifNotTester);
Actions.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(Actions, "actions");
SchemaHelpers.autoUpdateOrder(Actions, ["variables", "routes"]);