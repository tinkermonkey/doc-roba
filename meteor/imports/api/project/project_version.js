import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../_lib/schema_helpers.js';
import {Auth} from '../_lib/auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';
import {Projects} from './project.js';
import {Nodes} from '../node/node.js';

/**
 * User Project Versions
 */
export const ProjectVersion = new SimpleSchema({
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
export const ProjectVersions = new Mongo.Collection("project_versions");
ProjectVersions.attachSchema(ProjectVersion);
ProjectVersions.deny({
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
ProjectVersions.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(ProjectVersions, "project_versions");

/**
 * Helpers
 */
ProjectVersions.helpers({
  project: function () {
    return Projects.findOne(this.projectId)
  },
  userTypes: function () {
    return Nodes.find({projectVersionId: this._id, type: NodeTypes.userType}, {sort: {title: 1}});
  }
});