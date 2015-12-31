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
Collections.DataStoreRows.deny(Auth.ruleSets.deny.ifNotTester);
Collections.DataStoreRows.allow(Auth.ruleSets.allow.ifAuthenticated);
trackChanges(Collections.DataStoreRows, "data_store_rows");
