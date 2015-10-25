/**
 * ============================================================================
 * User Project Roles
 * ============================================================================
 */
Schemas.ProjectRole = new SimpleSchema({
  projectId: {
    type: String,
    denyUpdate: true
  },
  userId: {
    type: String,
    denyUpdate: true
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  role: {
    type: Number,
    allowedValues: _.values(RoleTypes)
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
ProjectRoles = new Mongo.Collection("project_roles");
ProjectRoles.attachSchema(Schemas.ProjectRole);
ProjectRoles.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated,
  fetch: []
});
ProjectRoles.deny({
  insert: allowIfAdmin,
  update: allowIfAdmin,
  remove: allowIfAdmin,
  fetch: ['projectId']
});
trackChanges(ProjectRoles, "project_roles");
