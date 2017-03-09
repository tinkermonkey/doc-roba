import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {SchemaHelpers} from '../schema_helpers.js';
import {Auth} from '../auth.js';

/**
 * Simple screenshot comparison cache
 */
export const ScreenshotComparison = new SimpleSchema({
  // Link to the project to which this comparison belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  baseScreenshot: {
    type: String,
    denyUpdate: true
  },
  compareScreenshot: {
    type: String,
    denyUpdate: true
  },
  result: {
    type: Object,
    blackbox: true
  },
  dateCreated: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateCreated,
    denyUpdate: true
  }
});
export const ScreenshotComparisons = new Mongo.Collection("screenshot_comparisons");
ScreenshotComparisons.attachSchema(ScreenshotComparison);
ScreenshotComparisons.deny(Auth.ruleSets.deny.ifNoProjectAccess);
ScreenshotComparisons.allow(Auth.ruleSets.allow.ifAuthenticated);

/**
 * Helpers
 */
ScreenshotComparisons.helpers({
});