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
