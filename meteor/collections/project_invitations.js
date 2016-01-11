/**
 * ============================================================================
 *  Project Invitations
 * ============================================================================
 */
Schemas.ProjectInvitations = new SimpleSchema({
  projectId: {
    type: String,
    denyUpdate: true
  },
  projectTitle: {
    type: String
  },
  projectRole: {
    type: Number,
    allowedValues: _.map(RoleTypes, function (d) { return d; })
  },
  invitorId: {
    type: String,
    denyUpdate: true
  },
  invitorName: {
    type: String
  },
  inviteeEmail: {
    type: String,
    denyUpdate: true,
    regEx: SimpleSchema.RegEx.Email
  },
  inviteeName: {
    type: String,
    denyUpdate: true,
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
Collections.ProjectInvitations = new Mongo.Collection("project_invitations");
Collections.ProjectInvitations.attachSchema(Schemas.ProjectInvitations);
Collections.ProjectInvitations.deny(Auth.ruleSets.deny.always);
Collections.ProjectInvitations.allow(Auth.ruleSets.allow.ifAuthenticated);

/**
 * Helpers
 */
Collections.ProjectInvitations.helpers({
  project: function () {
    return Collections.Projects.findOne(this.projectId);
  },
  invitor: function () {
    return Collections.Users.findOne(this.invitorId);
  }
});