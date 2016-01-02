/**
 * ============================================================================
 * Simple screenshot comparison cache
 * ============================================================================
 */
Schemas.ScreenshotComparison = new SimpleSchema({
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
    autoValue: autoValueDateCreated,
    denyUpdate: true
  }
});
Collections.ScreenshotComparisons = new Mongo.Collection("screenshot_comparisons");
Collections.ScreenshotComparisons.attachSchema(Schemas.ScreenshotComparison);
// casual users need to be able to create these when viewing test results
Collections.ScreenshotComparisons.deny(Auth.ruleSets.deny.ifNoProjectAccess);
Collections.ScreenshotComparisons.allow(Auth.ruleSets.allow.ifAuthenticated);

/**
 * Helpers
 */
Collections.ScreenshotComparisons.helpers({
});