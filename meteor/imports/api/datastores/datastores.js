import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {DatastoreFields} from './datastore_fields.js';
import {DatastoreRows} from './datastore_rows.js';
import {DatastoreCategories} from './datastore_catagories.js';
import {DSUtil} from './ds_util.js';

// List the collections that can be parents to datastores for retrieving parent records
import {Nodes} from '../nodes/nodes.js';
import {ProjectVersion} from '../projects/project_versions.js';

/**
 * General mechanism for storing schema information for custom data stores
 * This is used by the credentials mechanism
 */
export const Datastore = new SimpleSchema({
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
  // Parent record id
  parentId: {
    type: String
  },
  // Parent collection name
  parentCollectionName: {
    type: String
  },
  // Category of the datastore
  category: {
    type: Number,
    allowedValues: _.values(DatastoreCategories)
  },
  // Descriptive title
  title: {
    type: String
  },
  // This is used for rendering tables quickly
  tableSchemaDef: {
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
export const Datastores = new Mongo.Collection("datastores");
Datastores.attachSchema(Datastore);
Datastores.deny(Auth.ruleSets.deny.ifNotTester);
Datastores.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(Datastores, "datastores");

/**
 * Helpers
 */
Datastores.helpers({
  fields(){
    return DatastoreFields.find({dataStoreId: this.staticId, projectVersionId: this.projectVersionId}, {sort: {order: 1}});
  },
  rows(limit){
    return DatastoreRows.find({dataStoreId: this.staticId, projectVersionId: this.projectVersionId}, {limit: limit} );
  },
  parentRecord(){
    let dataStore = this;
    if (dataStore.parentId) {
      let collection = eval(dataStore.parentCollectionName);
      return collection.findOne({
        $or: [
          {_id: dataStore.parentId},
          {staticId: dataStore.parentId}
        ], projectVersionId: dataStore.projectVersionId
      });
    }
  },
  updateTableSchema(){
    //console.log("Datastores.updateTableSchema:", this);
    let tableSchemaDef = {fields: []};
    
    // build up the schema
    this.fields().forEach(function (field) {
      tableSchemaDef.fields.push(DSUtil.tableFieldDef(field));
      //tableSchemaDef[field.dataKey] = DSUtil.tableFieldDef(field);
    });
    
    // store the schema
    Datastores.update({_id: this._id}, {$set: {tableSchemaDef: tableSchemaDef}});
    return tableSchemaDef;
  },
  rowRenderer(){
    return Function('row', this.renderRowSelector || 'return row ? row[0] : \'undefined\'');
  },
  renderRow(datastoreRow){
    return this.rowRenderer()(datastoreRow);
  },
  getRenderedRows(){
    let renderedRows = [];
    this.rows().forEach((row) => {
      renderedRows.push({
        value: row._id,
        text: row.render()
      });
    });
    return renderedRows
  },
  tableSchema(){
    if(this.tableSchemaDef){
      //console.log("Datastores.tableSchema via storage:", this);
      return this.tableSchemaDef;
    } else {
      console.log("Datastores.tableSchema via update:", this);
      return this.updateTableSchema();
    }
  },
  simpleSchema(){
    let simpleSchemaDef = {};
    this.fields().forEach(function (field) {
      simpleSchemaDef[field.dataKey] = DSUtil.simpleFieldDef(field);
    });
    try {
      return new SimpleSchema(simpleSchemaDef);
    } catch (e) {
      console.error("Failed to generate simpleSchema for datastore:", simpleSchemaDef, e);
    }
  }
});