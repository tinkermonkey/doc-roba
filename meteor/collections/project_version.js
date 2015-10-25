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
ProjectVersions = new Mongo.Collection("project_versions");
ProjectVersions.attachSchema(Schemas.ProjectVersion);
ProjectVersions.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated,
  fetch: []
});
ProjectVersions.deny({
  insert: allowIfAdmin,
  update: allowIfAdmin,
  remove: allowIfAdmin,
  fetch: ['projectId']
});
trackChanges(ProjectVersions, "project_versions");
