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
Collections.ProjectVersions = new Mongo.Collection("project_versions");
Collections.ProjectVersions.attachSchema(Schemas.ProjectVersion);
Collections.ProjectVersions.deny({
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
Collections.ProjectVersions.allow(Auth.ruleSets.allow.ifAuthenticated);
trackChanges(Collections.ProjectVersions, "project_versions");

/**
 * Helpers
 */
Collections.ProjectVersions.helpers({
  project: function () {
    return Collections.Projects.findOne(this.projectId)
  },
  userTypes: function () {
    return Collections.Nodes.find({projectVersionId: this._id, type: NodeTypes.userType}, {sort: {title: 1}});
  }
});