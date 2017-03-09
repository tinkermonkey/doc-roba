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
    type   : Number,
    decimal: true,
    optional: true
  },
  // Mark the default viewport for a platform
  default: {
    type: Boolean,
    defaultValue: false
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

// Listed for changes and update the aspect ratio
if (Meteor.isServer) {
  // Maintain the aspect ratio
  PlatformViewports.before.insert(function (userId, doc) {
    doc.aspectRatio = doc.width / doc.height;
  });
  PlatformViewports.before.update(function (userId, doc, changedFields, modifier) {
    modifier.$set = modifier.$set || {};
    if (_.contains(changedFields, 'width') || _.contains(changedFields, 'height')) {
      let width  = modifier.$set.width || doc.width,
          height = modifier.$set.height || doc.height;
      console.log("PlatformViewports.before.update setting aspectRatio:", width / height);
      modifier.$set.aspectRatio = width / height;
    }
  });
  
  // Maintain the default flag
  PlatformViewports.after.update(function (userId, doc, changedFields, modifier) {
    // If the default flag is set to true
    if (_.contains(changedFields, 'default') && doc.default == true) {
      // Set the other viewports for this platform to default = false
      PlatformViewports.find({
        _id: { $ne: doc._id },
        platformId: doc.platformId,
        default: true
      }).forEach((viewport) => {
        console.log("Setting default from true to false:", viewport);
        PlatformViewports.update({_id: viewport._id}, {$set: {default: false}});
      });
    }
  });
}

/**
 * Helpers
 */
PlatformViewports.helpers({});