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
Collections.ProjectRoles = new Mongo.Collection("project_roles");
Collections.ProjectRoles.attachSchema(Schemas.ProjectRole);
Collections.ProjectRoles.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated,
  fetch: []
});
Collections.ProjectRoles.deny({
  insert: allowIfAdmin,
  update: allowIfAdmin,
  remove: allowIfAdmin,
  fetch: ['projectId']
});
trackChanges(Collections.ProjectRoles, "project_roles");
