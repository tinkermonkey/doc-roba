/**
 * ============================================================================
 * Test run - the setup for the running of multiple test cases
 * ============================================================================
 */
Schemas.TestRun = new SimpleSchema({
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
  testRunTemplateId: {
    type: String,
    denyUpdate: true
  },
  // Link to the server we're running against
  serverId: {
    type: String,
    denyUpdate: true
  },
  // Whether to wait for commands if there is a problem
  pauseOnFailure: {
    type: Boolean,
    defaultValue: false
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
Collections.TestRuns = new Mongo.Collection("test_runs");
Collections.TestRuns.attachSchema(Schemas.TestRun);
Collections.TestRuns.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
Collections.TestRuns.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});
