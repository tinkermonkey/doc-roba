import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Auth } from '../auth.js';
import { ChangeTracker } from '../change_tracker/change_tracker.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * PlatformViewports
 * ============================================================================
 */
export const PlatformViewport = new SimpleSchema({
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
  title           : {
    type: String,
  },
  width           : {
    type        : Number,
    defaultValue: 1024
  },
  height          : {
    type        : Number,
    defaultValue: 768
  },
  aspectRatio     : {
    type: Number,
    decimal: true,
    autoValue() {
      let width  = this.field('width'),
          height = this.field('height');
      console.log("aspectRatio.autoValue:", width, height, width.value / height.value);
      if(width.isSet && height.isSet){
        return width.value / height.value;
      }
    }
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

export const PlatformViewports = new Mongo.Collection("platform_viewports");
PlatformViewports.attachSchema(PlatformViewport);
PlatformViewports.deny(Auth.ruleSets.deny.ifNotTester);
PlatformViewports.allow(Auth.ruleSets.allow.ifAuthenticated);
ChangeTracker.TrackChanges(PlatformViewports, "platform_viewports");

/**
 * Helpers
 */
PlatformViewports.helpers({});