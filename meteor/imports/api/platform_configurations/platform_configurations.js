import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Auth } from '../auth.js';
import { ChangeTracker } from '../change_tracker/change_tracker.js';
import { SchemaHelpers } from '../schema_helpers.js';
import { PlatformViewports } from './platform_viewports.js';
import { PlatformOperatingSystems } from './platform_operating_systems.js';

/**
 * ============================================================================
 * PlatformConfiguration
 * ============================================================================
 */
export const PlatformConfiguration = new SimpleSchema({
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
  // Link to the platform node
  parentId        : {
    type      : String,
    denyUpdate: true
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

export const PlatformConfigurations = new Mongo.Collection("platform_configurations");
PlatformConfigurations.attachSchema(PlatformConfiguration);
// These should be created server-side only to prevent duplicates
ChangeTracker.TrackChanges(PlatformConfigurations, "platform_configurations");

/**
 * Helpers
 */
PlatformConfigurations.helpers({
  /**
   * Get the list of viewports for this PlatformConfig
   * @return [PlatformViewport]
   */
  viewports(){
    return PlatformViewports.find({platformId: this._id}, {sort: {title: 1}});
  },
  /**
   * Get the default viewport for this PlatformConfig
   * @return PlatformViewport
   */
  defaultViewport(){
    return PlatformViewports.findOne({platformId: this._id, default: true});
  },
  /**
   * Get the list of operating systems for this PlatformConfig
   * @return [PlatformOperatingSystem]
   */
  operatingSystems(){
    return PlatformOperatingSystems.find({platformId: this._id}, {sort: {title: 1}});
  }
});