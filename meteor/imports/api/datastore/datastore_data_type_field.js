import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Auth} from '../auth.js';
import {Util} from '../util.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {SchemaHelpers} from '../schema_helpers.js';

import {DSUtil} from './ds_util.js';
import {DatastoreDataTypes} from './datastore_data_type.js';
import {FieldTypes} from './field_types.js';

/**
 * ============================================================================
 * DatastoreDataTypeField
 * ============================================================================
 */
export const DatastoreDataTypeField = new SimpleSchema({
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
  dataTypeId: {
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
  customFieldType: {
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

export const DatastoreDataTypeFields = new Mongo.Collection("datastore_data_type_fields");
DatastoreDataTypeFields.attachSchema(DatastoreDataTypeField);
DatastoreDataTypeFields.deny(Auth.ruleSets.deny.ifNotTester);
DatastoreDataTypeFields.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(DatastoreDataTypeFields, "datastore_data_type_fields");

/**
 * Observe the changes to the fields collection in order to update the schemas
 */
if(Meteor.isServer){
  DatastoreDataTypeFields.after.insert(function (userId, field) {
    // Update the schema
    DatastoreDataTypes.findOne({_id: field.dataTypeId}).updateTableSchema();
  });
  DatastoreDataTypeFields.after.update(function (userId, field, changedParams) {
    // Update the schema
    DatastoreDataTypes.findOne({_id: field.dataTypeId}).updateTableSchema();
  });
  DatastoreDataTypeFields.after.remove(function (userId, field) {
    // Update the schema
    DatastoreDataTypes.findOne({_id: field.dataTypeId}).updateTableSchema();
  });
}

/**
 * Helpers
 */
DatastoreDataTypeFields.helpers({
  dataType(){
    return DatastoreDataTypes.findOne({_id: this.dataTypeId});
  },
  schema(){
    let field = this;
    if(field.customFieldType){
      return field.dataType().schema;
    }
  },
  simpleSchemaType(){
    return DSUtil.dataTypeLiteral(this);
  }
  
});