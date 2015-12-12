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
ScreenshotComparisons = new Mongo.Collection("screenshot_comparisons");
ScreenshotComparisons.attachSchema(Schemas.ScreenshotComparison);
ScreenshotComparisons.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
ScreenshotComparisons.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

/**
 * Helpers
 */
ScreenshotComparisons.helpers({
});