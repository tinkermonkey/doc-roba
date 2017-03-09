import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Auth } from '../auth.js';
import { ChangeTracker } from '../change_tracker/change_tracker.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * PlatformOperatingSystem
 * ============================================================================
 */
export const PlatformOperatingSystem = new SimpleSchema({
  // Link to the project to which this test belongs
  projectId       : {
    type      : String,
    denyUpdate: true
  },
  // Link to the project version to which this test belongs
  projectVersionId: {
    type      : String,
    denyUpdate: true
  },
  // Link to the platform configuration record
  platformId      : {
    type      : String,
    denyUpdate: true
  },
  // OS title
  title           : {
    type: String
  },
  // OS Versions
  versions        : {
    type: [ String ],
    optional: true
  },
  // OS Icon css class
  iconCss         : {
    type    : String,
    optional: true
  },
  // Standard tracking fields
  dateCreated     : {
    type      : Date,
    autoValue : SchemaHelpers.autoValueDateCreated,
    denyUpdate: true
  },
  createdBy       : {
    type      : String,
    autoValue : SchemaHelpers.autoValueCreatedBy,
    denyUpdate: true
  },
  dateModified    : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy      : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const PlatformOperatingSystems = new Mongo.Collection("platform_operating_systems");
PlatformOperatingSystems.attachSchema(PlatformOperatingSystem);
PlatformOperatingSystems.deny(Auth.ruleSets.deny.ifNotTester);
PlatformOperatingSystems.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(PlatformOperatingSystems, "platform_operating_systems");

/**
 * Helpers
 */
PlatformOperatingSystems.helpers({});