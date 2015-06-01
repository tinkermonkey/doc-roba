/**
 * ============================================================================
 * General mechanism for storing schema information for custom data stores
 * This is used by the credentials mechanism
 * ============================================================================
 */
Schemas.DataStore = new SimpleSchema({
  title: {
    type: String
  },
  dataKey: {
    type: String
  },
  category: {
    type: String
  },
  schema: {
    type: Object,
    blackbox: true,
    optional: true
  },
  // We don't want to deal with deleting the actual data, so just mark it deleted
  deleted: {
    type: Boolean,
    defaultValue: false
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
  // A code fragment to render an identifier for a row (Like assemble a name or whatever so you can select a row)
  renderRowSelector: {
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
DataStores = new Mongo.Collection("data_stores");
DataStores.attachSchema(Schemas.DataStore);
DataStores.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
DataStores.deny({
  insert: function (userId, field) {
    var pr = ProjectRoles.findOne({userId: userId, projectId: field.projectId});
    return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
  },
  update: function (userId, field, fields, modifier) {
    var pr = ProjectRoles.findOne({userId: userId, projectId: field.projectId});
    return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
  },
  remove: function (userId, field) {
    var pr = ProjectRoles.findOne({userId: userId, projectId: field.projectId});
    return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
  },
  fetch: ['projectId']
});
trackChanges(DataStores, "data_stores");

/**
 * ============================================================================
 * Describe the structure of a particular data store
 * ============================================================================
 */
Schemas.DataStoreField = new SimpleSchema({
  title: {
    type: String
  },
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
DataStoreFields = new Mongo.Collection("data_store_fields");
DataStoreFields.attachSchema(Schemas.DataStoreField);
DataStoreFields.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
DataStoreFields.deny({
  insert: function (userId, field) {
    var pr = ProjectRoles.findOne({userId: userId, projectId: field.projectId});
    return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
  },
  update: function (userId, field, fields, modifier) {
    var pr = ProjectRoles.findOne({userId: userId, projectId: field.projectId});
    return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
  },
  remove: function (userId, field) {
    var pr = ProjectRoles.findOne({userId: userId, projectId: field.projectId});
    return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
  },
  fetch: ['projectId']
});
trackChanges(DataStoreFields, "data_store_fields");

/**
 * ============================================================================
 * The data rows for the data stores
 * ============================================================================
 */
Schemas.DataStoreRow = new SimpleSchema({
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
DataStoreRows = new Mongo.Collection("data_store_rows");
DataStoreRows.attachSchema(Schemas.DataStoreRow);
DataStoreRows.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
DataStoreRows.deny({
  insert: function (userId, field) {
    var pr = ProjectRoles.findOne({userId: userId, projectId: field.projectId});
    return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
  },
  update: function (userId, field, fields, modifier) {
    var pr = ProjectRoles.findOne({userId: userId, projectId: field.projectId});
    return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
  },
  remove: function (userId, field) {
    var pr = ProjectRoles.findOne({userId: userId, projectId: field.projectId});
    return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
  },
  fetch: ['projectId']
});
trackChanges(DataStoreRows, "data_store_rows");

/**
 * ============================================================================
 * Observe the changes to the fields collection in order to update the schemas
 * ============================================================================
 */
if(Meteor.isServer){
  DataStoreFields.after.insert(function (userId, fieldDef) {
    // Update the schema
    updateDataStoreSchema(fieldDef.dataStoreId);
  });
  DataStoreFields.after.update(function (userId, fieldDef, changedParams) {
    // Find all of the embedded usages

    // Rename the field for all existing records

    // Update the schema
    updateDataStoreSchema(fieldDef.dataStoreId);
  });
  DataStoreFields.after.remove(function (userId, fieldDef) {
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
    var fields = DataStoreFields.find({dataStoreId: dataStoreId}, {sort: {order: 1}});

    // build up the schema
    fields.forEach(function (field) {
      var fieldDef = {
        label: field.title,
        type: field.type,
        customFieldType: field.customFieldType,
        fieldIsArray: field.fieldIsArray
      };

      schema[field.dataKey] = fieldDef;
    });

    // store the schema
    console.log("DataStoreSchema: ", schema);
    DataStores.update({_id: dataStoreId}, {$set: {schema: schema}});
  };
}
