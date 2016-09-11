import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
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
    autoValue() {
      let width  = this.field('width'),
          height = this.field('height');
      return width/height;
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

/**
 * Helpers
 */
PlatformViewports.helpers({});