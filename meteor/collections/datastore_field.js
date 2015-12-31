
/**
 * ============================================================================
 * Describe the structure of a particular data store
 * ============================================================================
 */
Schemas.DataStoreField = new SimpleSchema({
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
    autoValue: autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type: Date,
    autoValue: autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: autoValueModifiedBy
  }
});
Collections.DataStoreFields = new Mongo.Collection("data_store_fields");
Collections.DataStoreFields.attachSchema(Schemas.DataStoreField);
Collections.DataStoreFields.deny(Auth.ruleSets.deny.ifNotTester);
Collections.DataStoreFields.allow(Auth.ruleSets.allow.ifAuthenticated);
trackChanges(Collections.DataStoreFields, "data_store_fields");

/**
 * ============================================================================
 * Observe the changes to the fields collection in order to update the schemas
 * ============================================================================
 */
if(Meteor.isServer){
  Collections.DataStoreFields.after.insert(function (userId, fieldDef) {
    // Update the schema
    updateDataStoreSchema(fieldDef.dataStoreId);
  });
  Collections.DataStoreFields.after.update(function (userId, fieldDef, changedParams) {
    // Find all of the embedded usages

    // Rename the field for all existing records

    // Update the schema
    updateDataStoreSchema(fieldDef.dataStoreId);
  });
  Collections.DataStoreFields.after.remove(function (userId, fieldDef) {
    // Find all of the embedded usages

    // Remove the field from all existing records

    // Update the schema
    updateDataStoreSchema(fieldDef.dataStoreId);
  });

  /**
   * Update the schema for a data store
   * @param dataStoreId
   */
  updateDataStoreSchema = function (dataStoreId) {
    Meteor.log.debug("updateDataStoreSchema: ", dataStoreId);
    var schema = {};

    // get all of the fields
    var fields = Collections.DataStoreFields.find({dataStoreId: dataStoreId}, {sort: {order: 1}});

    // build up the schema
    fields.forEach(function (field) {
      var fieldDef = {
        label: field.title,
        type: field.type,
        customFieldType: field.customFieldType,
        fieldIsArray: field.fieldIsArray,
        defaultValue: field.defaultValue
      };

      schema[field.dataKey] = fieldDef;
    });

    // store the schema
    console.log("DataStoreSchema: ", schema);
    Collections.DataStores.update({_id: dataStoreId}, {$set: {schema: schema}});
  };
}
