/**
 * DataStore utility functions
 */
DSUtil = {
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
        optional: true
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
              console.error("getDataStoreSchema Failed, could not find child store: ", field);
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
    var row = DataStoreRows.findOne(rowId),
      dataStore = DataStores.findOne(row.dataStoreId);
    if(dataStore && row){
      var renderer = DSUtil.rowRenderer(dataStore);
      return renderer(row);
    } else {
      return '';
    }
  },

  /**
   * Get a set of data store rows rendered for a selector
   * @param dataKey The key that identifies the datastore
   */
  getRenderedDataStoreRows: function (dataKey, query) {
    var dataStore = DataStores.findOne({dataKey: dataKey});
    if(dataStore){
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
      }).sort(function (row) { return row.text; })
    } else {
      return [];
    }
  }
};