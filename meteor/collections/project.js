/**
 * ============================================================================
 * User Projects
 * ============================================================================
 */
Schemas.Project = new SimpleSchema({
  title: {
    type: String
  },
  owner: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  logo: {
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
Collections.Projects = new Mongo.Collection("projects");
Collections.Projects.attachSchema(Schemas.Project);
Collections.Projects.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated,
  fetch: []
});
Collections.Projects.deny({
  insert: allowIfAdmin,
  update: allowIfAdmin,
  remove: allowIfAdmin,
  fetch: ['owner']
});
trackChanges(Collections.Projects, "projects");
