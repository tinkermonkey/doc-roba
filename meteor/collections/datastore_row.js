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
Collections.DataStoreRows = new Mongo.Collection("data_store_rows");
Collections.DataStoreRows.attachSchema(Schemas.DataStoreRow);
Collections.DataStoreRows.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
Collections.DataStoreRows.deny({
  insert: function (userId, field) {
    var pr = Collections.ProjectRoles.findOne({userId: userId, projectId: field.projectId});
    return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
  },
  update: function (userId, field, fields, modifier) {
    var pr = Collections.ProjectRoles.findOne({userId: userId, projectId: field.projectId});
    return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
  },
  remove: function (userId, field) {
    var pr = Collections.ProjectRoles.findOne({userId: userId, projectId: field.projectId});
    return !(userId && pr && (pr.role === RoleTypes.admin || pr.role === RoleTypes.owner));
  },
  fetch: ['projectId']
});
trackChanges(Collections.DataStoreRows, "data_store_rows");
