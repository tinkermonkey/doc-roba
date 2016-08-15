import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';

/**
 * General mechanism for storing schema information for custom data stores
 * This is used by the credentials mechanism
 */
export const DataStore = new SimpleSchema({
  // Link to the project to which this field belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this field belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // Descriptive title
  title: {
    type: String
  },
  // Key used to identify records
  dataKey: {
    type: String
  },
  // DataStoreCategory
  category: {
    type: String
  },
  // Stored basic schema
  schema: {
    type: Object,
    blackbox: true,
    optional: true
  },
  // We don't want to deal with deleting the actual data, so just mark it deleted
  deleted: {
    type: Boolean,
    defaultValue: false
  },
  // A code fragment to render an identifier for a row (Like assemble a name or whatever so you can select a row)
  renderRowSelector: {
    type: String,
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
export const DataStores = new Mongo.Collection("data_stores");
DataStores.attachSchema(DataStore);
DataStores.deny(Auth.ruleSets.deny.ifNotTester);
DataStores.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(DataStores, "data_stores");
