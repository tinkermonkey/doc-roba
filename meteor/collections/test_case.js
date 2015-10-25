/**
 * ============================================================================
 * Test case
 * ============================================================================
 */
Schemas.TestCase = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: autoValueObjectId,
    denyUpdate: true
  },
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
  // Link to a group perhaps via the staticId
  testGroupId: {
    type: String,
    optional: true
  },
  // Test title
  title: {
    type: String
  },
  // Perhaps we'll have descriptions
  description: {
    type: String,
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
  },
  dateModified: {
    type: Date,
    autoValue: autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: autoValueModifiedBy
  }
});
TestCases = new Mongo.Collection("test_cases");
TestCases.attachSchema(Schemas.TestCase);
TestCases.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestCases.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});
trackChanges(TestCases, "test_cases");
