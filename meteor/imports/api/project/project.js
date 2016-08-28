import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';
import {ChangeTracker} from '../change_tracker/change_tracker.js';

import {ProjectVersions} from './project_version.js';

import {CodeLanguages} from '../code_module/code_languages.js';

/**
 * User Projects
 */
export const Project = new SimpleSchema({
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
  automationLanguage: {
    type: Number,
    allowedValues: _.values(CodeLanguages),
    defaultValue: CodeLanguages.javascript
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
export const Projects = new Mongo.Collection("projects");
Projects.attachSchema(Project);

/**
 * Custom deny function which looks at the user level and Meteor settings
 */
Projects.deny({
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
Projects.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(Projects, "projects");

/**
 * Helpers
 */
Projects.helpers({
  versions: function () {
    return ProjectVersions.find({projectId: this._id})
  }
});