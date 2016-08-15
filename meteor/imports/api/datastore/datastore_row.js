import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';

/**
 * The data rows for the data stores
 */
export const DataStoreRow = new SimpleSchema({
  // Link to the data store to which this field belongs
  dataStoreId: {
    type: String
  },
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
export const DataStoreRows = new Mongo.Collection("data_store_rows");
DataStoreRows.attachSchema(DataStoreRow);
DataStoreRows.deny(Auth.ruleSets.deny.ifNotTester);
DataStoreRows.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(DataStoreRows, "data_store_rows");
