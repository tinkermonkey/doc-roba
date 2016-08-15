import {FieldTypes} from './field_types.js';
import {DataStores} from './datastore.js';
import {DataStoreFields} from './datastore_field.js';
import {DataStoreRows} from './datastore_row.js';

/**
 * Create a cache for storing data store schemas that have been generated
 */
export const DataStoreSchemas = {};

/**
 * DataStore utility functions
 */
export const DSUtil = {
  /**
   * Fetch a simple schema by _id
   */
  getSimpleSchemaById: function (dataStoreId) {
    var ds = DataStores.findOne({_id: dataStoreId});
    if(ds){
      //if(!DataStoreSchemas[ds._id]){
        DataStoreSchemas[ds._id] = DSUtil.simpleSchema(ds.schema);
      //}
      return DataStoreSchemas[ds._id];
    }
  },

  /**
   * Fetch a simple schema by dataStoreKey
   */
  getSimpleSchemaByKey: function (dataStoreKey) {
    var ds = DataStores.findOne({dataKey: dataStoreKey});
    if(ds){
      //if(!DataStoreSchemas[ds._id]){
        DataStoreSchemas[ds._id] = DSUtil.simpleSchema(ds.schema);
      //}
      return DataStoreSchemas[ds._id];
    }
  },

  /**
   * Take a data store schema and create a simple schema from it
   */
  simpleSchema: function (dsSchema) {
    var schemaFields = {};

    _.each(_.keys(dsSchema), function (fieldName) {
      //console.log("Creating simple schema field def from field: ", fieldName, dsSchema[fieldName]);
      var field = dsSchema[fieldName];
      schemaFields[fieldName] = {
        label: field.label,
        type: field.fieldIsArray ? [Util.fieldTypeLiteral(field.type)] : Util.fieldTypeLiteral(field.type),
        optional: true,
        defaultValue: field.defaultValue
      };

      if(field.type === FieldTypes.custom){
        // get the schema
        if(field.customFieldType && Meteor.isClient){
          // Create the schema if it doesn't exist
          if(!DataStoreSchemas[field.customFieldType]){
            //console.log("Generating child schema: ", field.customFieldType);
            var childStore = DataStores.findOne(field.customFieldType);
            if(childStore){
              DataStoreSchemas[field.customFieldType] = DSUtil.simpleSchema(childStore.schema);
            } else {
              console.error("DSUtil.simpleSchema Failed, could not find child store: ", field);
              return;
            }
          }

          schemaFields[fieldName].type = field.fieldIsArray ? [DataStoreSchemas[field.customFieldType]] : DataStoreSchemas[field.customFieldType];
        } else {
          schemaFields[fieldName].blackbox = true;
        }
      }
    });

    // Create the simple schema
    var schema;
    try {
      //console.log("Creating Simple Schema: ", schemaFields);
      schema = new SimpleSchema(schemaFields);
    } catch (e) {
      console.error("Failed to create datastore schema: ", e);
      console.error("Failed Schema Def: ", schemaFields);
    }

    return schema;
  },


  /**
   * Get the full basic schema definition for a datastore
   * @param dsId The datastore ID
   */
  flexSchema: function (dsId) {
    var store = DataStores.findOne(dsId);
    store.fields = DataStoreFields.find({dataStoreId: dsId}, {sort: {order: 1}}).fetch();

    _.each(store.fields, function (field) {
      if(field.type === FieldTypes.custom){
        // get the schema
        if(field.customFieldType){
          field.schema = DSUtil.flexSchema(field.customFieldType);
        }
      }
    });

    return store;
  },

  /**
   * Generate a function with the row renderer fragment
   * @param dataStore
   */
  rowRenderer: function (dataStore) {
    return Function('row', dataStore.renderRowSelector || 'return row ? row[0] : \'undefined\'');
  },

  /**
   * Render an identifier for a row
   * @param rowId The _id of the row to render
   */
  renderRow: function (rowId) {
    if(rowId){
      var row = DataStoreRows.findOne(rowId);
      if(row){
        var dataStore = DataStores.findOne(row.dataStoreId);
        if(dataStore && row){
          var renderer = DSUtil.rowRenderer(dataStore);
          return renderer(row);
        }
      }
    }
    return '';
  },

  /**
   * Get a set of data store rows rendered for a selector
   * @param dataKey The key that identifies the datastore
   */
  getRenderedDataStoreRows: function (dataKey, query) {
    if(dataKey) {
      var dataStore = DataStores.findOne({dataKey: dataKey});
      if (dataStore) {
        // assemble the query
        query = query || {};
        query.dataStoreId = dataStore._id;

        // Get the rows and the renderer
        var renderer = DSUtil.rowRenderer(dataStore);
        return DataStoreRows.find(query).map(function (row) {
          var text = renderer(row);
          return {
            value: row._id,
            text: text
          };
        }).sort(function (row) {
          return row.text;
        })
      }
    }
    return [];
  }
};