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
  parentId: {
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
    DatastoreDataTypes.findOne({staticId: field.parentId, projectVersionId: field.projectVersionId}).updateTableSchema();
  });
  DatastoreDataTypeFields.after.update(function (userId, field) {
    // Update the schema
    DatastoreDataTypes.findOne({staticId: field.parentId, projectVersionId: field.projectVersionId}).updateTableSchema();
  });
  DatastoreDataTypeFields.after.remove(function (userId, field) {
    // Update the schema
    DatastoreDataTypes.findOne({staticId: field.parentId, projectVersionId: field.projectVersionId}).updateTableSchema();
  });
}

/**
 * Helpers
 */
DatastoreDataTypeFields.helpers({
  dataType(){
    //console.log("DatastoreDataTypeFields.dataType:", this);
    let field = this;
    //return DatastoreDataTypes.findOne({staticId: this.parentId, projectVersionId: this.projectVersionId});
    if(field.dataTypeId){
      return DatastoreDataTypes.findOne({staticId: field.dataTypeId, projectVersionId: field.projectVersionId});
    }
  },
  tableSchema(){
    let field = this;
    if(field.dataTypeId){
      //console.log("DatastoreDataTypeFields.tableSchema:", this);
      return field.dataType().tableSchema();
    }
  },
  simpleSchema(){
    //console.log("DatastoreDataTypeFields.simpleSchema:", this);
    return DSUtil.dataTypeLiteral(this);
  }
});