/**
 * ============================================================================
 * General mechanism for storing schema information for custom data stores
 * This is used by the credentials mechanism
 * ============================================================================
 */
Schemas.DataStore = new SimpleSchema({
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
  // Key used to identify records
  dataKey: {
    type: String
  },
  // DataStoreCategory
  category: {
    type: String
  },
  // Stored basic schema
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