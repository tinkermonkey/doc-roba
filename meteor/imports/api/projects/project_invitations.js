import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ProjectRoles} from './project_roles.js';
import {Projects} from './projects.js';
import {Users} from '../users/users.js';

/**
 *  Project Invitations
 */
export const ProjectInvitation = new SimpleSchema({
  projectId: {
    type: String,
    denyUpdate: true
  },
  projectTitle: {
    type: String
  },
  projectRole: {
    type: Number,
    allowedValues: _.map(ProjectRoles, function (d) { return d; })
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
    autoValue: SchemaHelpers.autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});
export const ProjectInvitations = new Mongo.Collection("project_invitations");
ProjectInvitations.attachSchema(ProjectInvitation);
ProjectInvitations.deny(Auth.ruleSets.deny.always);
ProjectInvitations.allow(Auth.ruleSets.allow.ifAuthenticated);

/**
 * Helpers
 */
ProjectInvitations.helpers({
  project() {
    return Projects.findOne(this.projectId);
  },
  invitor() {
    return Users.findOne(this.invitorId);
  }
});