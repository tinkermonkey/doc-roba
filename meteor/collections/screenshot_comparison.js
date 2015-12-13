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
Collections.ScreenshotComparisons.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
Collections.ScreenshotComparisons.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

/**
 * Helpers
 */
Collections.ScreenshotComparisons.helpers({
});