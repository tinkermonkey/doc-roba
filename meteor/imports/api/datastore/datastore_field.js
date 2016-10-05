import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {FieldTypes} from './field_types.js';
import {Datastores} from './datastore.js';
import {DatastoreDataTypes} from './datastore_data_type.js';

import {DSUtil} from './ds_util.js';

/**
 * Describe the structure of a particular data store
 */
export const DatastoreField = new SimpleSchema({
  staticId: {
    type: String,
    index: true,
    autoValue: SchemaHelpers.autoValueObjectId,
    denyUpdate: true
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
  // Link to the data store to which this field belongs
  dataStoreId: {
    type: String
  },
  // Field title
  title: {
    type: String
  },
  // Field datakey
  dataKey: {
    type: String
  },
  type: {
    type: Number,
    allowedValues: _.map(FieldTypes, function (d) { return d; })
  },
  dataTypeId: {
    type: String,
    optional: true
  },
  fieldIsArray: {
    type: Boolean,
    defaultValue: false
  },
  order: {
    type: Number
  },
  // Javascript literal
  defaultValue: {
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
export const DatastoreFields = new Mongo.Collection("datastore_fields");
DatastoreFields.attachSchema(DatastoreField);
DatastoreFields.deny(Auth.ruleSets.deny.ifNotTester);
DatastoreFields.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(DatastoreFields, "datastore_fields");

/**
 * Observe the changes to the fields collection in order to update the schemas
 */
if(Meteor.isServer){
  DatastoreFields.after.insert(function (userId, field) {
    // Update the schema
    Datastores.findOne({staticId: field.dataStoreId, projectVersionId: field.projectVersionId}).updateTableSchema();
  });
  DatastoreFields.after.update(function (userId, field) {
    // Update the schema
    Datastores.findOne({staticId: field.dataStoreId, projectVersionId: field.projectVersionId}).updateTableSchema();
  });
  DatastoreFields.after.remove(function (userId, field) {
    // Update the schema
    Datastores.findOne({staticId: field.dataStoreId, projectVersionId: field.projectVersionId}).updateTableSchema();
  });
}

/**
 * Helpers
 */
DatastoreFields.helpers({
  datastore(){
    return Datastores.findOne({staticId: this.dataStoreId, projectVersionId: this.projectVersionId});
  },
  dataType(){
    //console.log("DatastoreFields.dataType:", this);
    let field = this;
    if(field.dataTypeId){
      return DatastoreDataTypes.findOne({staticId: field.dataTypeId, projectVersionId: field.projectVersionId});
    }
  },
  tableSchema(){
    let field = this;
    if(field.dataTypeId){
      //console.log("DatastoreField.tableSchema:", this);
      return field.dataType().tableSchema();
    }
  },
  simpleSchema(){
    //console.log("DatastoreFields.simpleSchema:", this);
    return DSUtil.dataTypeLiteral(this);
  }
});