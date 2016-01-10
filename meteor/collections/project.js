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
  active: {
    type: Boolean,
    defaultValue: true
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

/**
 * Custom deny function which looks at the user level and Meteor settings
 */
Collections.Projects.deny({
  insert: Auth.denyAlways,
  update: function (userId, doc) {
    var user = Meteor.users.findOne(userId);
    if(userId && user && doc && doc._id){
      return !user.hasAdminAccess(doc._id);
    }
    return true;
  },
  remove: Auth.denyAlways,
  fetch: ['projectId']
});
Collections.Projects.allow(Auth.ruleSets.allow.ifAuthenticated);
trackChanges(Collections.Projects, "projects");

/**
 * Helpers
 */
Collections.Projects.helpers({
  versions: function () {
    return Collections.ProjectVersions.find({projectId: this._id})
  }
});