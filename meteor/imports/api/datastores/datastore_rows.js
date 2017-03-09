import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';

import {Datastores} from './datastores.js';

/**
 * The data rows for the data stores
 */
export const DatastoreRow = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: SchemaHelpers.autoValueObjectId,
    denyUpdate: true
  },
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
  // The data for this row
  data: {
    type: Object,
    blackbox: true,
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
export const DatastoreRows = new Mongo.Collection("datastore_rows");
DatastoreRows.attachSchema(DatastoreRow);
DatastoreRows.deny(Auth.ruleSets.deny.ifNotTester);
DatastoreRows.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(DatastoreRows, "datastore_rows");

/**
 * Helpers
 */
DatastoreRows.helpers({
  datastore(){
    return Datastores.findOne({staticId: this.dataStoreId, projectVersionId: this.projectVersionId});
  },
  render(){
    return this.datastore().renderRow(this);
  }
});