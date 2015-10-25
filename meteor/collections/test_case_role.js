/**
 * ============================================================================
 * Test case role - the actions of one user for a test
 * ============================================================================
 */
Schemas.TestCaseRole = new SimpleSchema({
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
  // Link to the test case via the staticId
  testCaseId: {
    type: String,
    denyUpdate: true
  },
  // Role title
  title: {
    type: String
  },
  // Description of this role
  description: {
    type: String,
    optional: true
  },
  // Step order
  order: {
    type: Number
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
TestCaseRoles = new Mongo.Collection("test_case_roles");
TestCaseRoles.attachSchema(Schemas.TestCaseRole);
TestCaseRoles.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestCaseRoles.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});
trackChanges(TestCaseRoles, "test_case_roles");
