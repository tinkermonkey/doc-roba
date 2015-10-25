/**
 * ============================================================================
 * Test case step - a single test step for a single user
 * ============================================================================
 */
Schemas.TestCaseStep = new SimpleSchema({
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
  // Link to the test case role via the staticId
  testCaseRoleId: {
    type: String,
    denyUpdate: true
  },
  // Step order
  order: {
    type: Number
  },
  // Bind to the static Type constant
  type: {
    type: Number,
    allowedValues: _.map(TestCaseStepTypes, function (d) { return d; })
  },
  // Step data
  data: {
    type: Object,
    blackbox: true,
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
TestCaseSteps = new Mongo.Collection("test_case_steps");
TestCaseSteps.attachSchema(Schemas.TestCaseStep);
TestCaseSteps.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestCaseSteps.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});
trackChanges(TestCaseSteps, "test_case_steps");