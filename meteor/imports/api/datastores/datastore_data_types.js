import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {Util} from '../util.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {SchemaHelpers} from '../schema_helpers.js';

import {DSUtil} from './ds_util.js';
import {DatastoreDataTypeFields} from './datastore_data_type_fields.js';

/**
 * ============================================================================
 * DatastoreDataType
 * ============================================================================
 */
export const DatastoreDataType = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
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
  // Descriptive title
  title: {
    type: String
  },
  // Stored basic schema
  tableSchemaDef: {
    type: Object,
    blackbox: true,
    optional: true
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

export const DatastoreDataTypes = new Mongo.Collection("datastore_data_types");
DatastoreDataTypes.attachSchema(DatastoreDataType);
DatastoreDataTypes.deny(Auth.ruleSets.deny.ifNotTester);
DatastoreDataTypes.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(DatastoreDataTypes, "datastore_data_types");

/**
 * Helpers
 */
DatastoreDataTypes.helpers({
  fields(){
    return DatastoreDataTypeFields.find({parentId: this.staticId, projectVersionId: this.projectVersionId}, {sort: {order: 1}});
  },
  updateTableSchema(){
    //console.log("DatastoreDataTypes.updateTableSchema:", this);
    let tableSchemaDef = {fields: []};
  
    // build up the schema
    this.fields().forEach(function (field) {
      tableSchemaDef.fields.push(DSUtil.tableFieldDef(field));
    });
    
    // store the schema
    DatastoreDataTypes.update({_id: this._id}, {$set: {tableSchemaDef: tableSchemaDef}});
  },
  rowRenderer(){
    return Function('row', this.renderRowSelector || 'return row ? row[0] : \'undefined\'');
  },
  renderRow(row){
    return this.rowRenderer()(row);
  },
  tableSchema(){
    if(this.tableSchemaDef){
      //console.log("DatastoreDataTypes.tableSchema via storage:", this);
      return this.tableSchemaDef;
    } else {
      console.log("DatastoreDataTypes.tableSchema via update:", this);
      return this.updateTableSchema();
    }
  },
  simpleSchema(){
    //console.log("DatastoreDataType.simpleSchema:", this);
    let simpleSchemaDef = {};
    this.fields().forEach((field) => {
      simpleSchemaDef[field.dataKey] = DSUtil.simpleFieldDef(field);
    });
    try {
      return new SimpleSchema(simpleSchemaDef);
    } catch(e) {
      console.error("Failed to generate simpleSchema for datastore:", simpleSchemaDef, e);
    }
  }
});