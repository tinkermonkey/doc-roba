/**
 * ============================================================================
 * User Project Versions
 * ============================================================================
 */
Schemas.ProjectVersion = new SimpleSchema({
  projectId: {
    type: String,
    denyUpdate: true
  },
  version: {
    type: String
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
Collections.ProjectVersions = new Mongo.Collection("project_versions");
Collections.ProjectVersions.attachSchema(Schemas.ProjectVersion);
Collections.ProjectVersions.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated,
  fetch: []
});
Collections.ProjectVersions.deny({
  insert: allowIfAdmin,
  update: allowIfAdmin,
  remove: allowIfAdmin,
  fetch: ['projectId']
});
trackChanges(Collections.ProjectVersions, "project_versions");
