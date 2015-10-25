/**
 * ============================================================================
 * Test run stage
 * ============================================================================
 */
Schemas.TestRunStage = new SimpleSchema({
  // Link to the project to which this test belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this test belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // Link to test run template
  parentId: {
    type: String,
    denyUpdate: true
  },
  // The status
  status: {
    type: Number,
    allowedValues: _.map(TestResultStatus, function (d) { return d; }),
    defaultValue: TestResultStatus.staged
  },
  // The result
  result: {
    type: Number,
    allowedValues: _.map(TestResultCodes, function (d) { return d; }),
    optional: true
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: autoValueDateCreated,
    denyUpdate: true
  },
  createdBy: {
    type: String,
    autoValue: autoValueCreatedBy,
    denyUpdate: true
  }
});
TestRunStages = new Mongo.Collection("test_run_stages");
TestRunStages.attachSchema(Schemas.TestRunStage);
TestRunStages.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestRunStages.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});
