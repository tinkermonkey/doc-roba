/**
 * ============================================================================
 * A simple means of grouping tests
 * ============================================================================
 */
Schemas.TestGroup = new SimpleSchema({
  // Static ID field that will be constant across versions of the project
  staticId: {
    type: String,
    index: true,
    autoValue: autoValueObjectId,
    denyUpdate: true
  },
  // Link to the project to which this group belongs
  projectId: {
    type: String,
    denyUpdate: true
  },
  // Link to the project version to which this group belongs
  projectVersionId: {
    type: String,
    denyUpdate: true
  },
  // Link to another group perhaps via the staticId
  parentGroupId: {
    type: String,
    optional: true
  },
  // Group title
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
TestGroups = new Mongo.Collection("test_groups");
TestGroups.attachSchema(Schemas.TestGroup);
TestGroups.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestGroups.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});
trackChanges(TestGroups, "test_groups");

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
    optional: true
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
  // Link to the test case role via the staticId
  testCaseRoleId: {
    type: String,
    optional: true
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
  // Node Id
  nodeId: {
    type: String,
    optional: true
  },
  // Action Id
  actionId: {
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

/**
 * ============================================================================
 * Test case result - the umbrella result for a test execution
 * ============================================================================
 */
Schemas.TestResult = new SimpleSchema({
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
TestResults = new Mongo.Collection("test_results");
TestResults.attachSchema(Schemas.TestResult);
TestResults.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestResults.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

/**
 * ============================================================================
 * Test role result - the result for a single user
 * ============================================================================
 */
Schemas.TestRoleResult = new SimpleSchema({
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
  // Link to the test result via the staticId
  testResultId: {
    type: String
  },
  // Link to the test case role via the staticId
  testCaseRoleId: {
    type: String
  }
});
TestRoleResults = new Mongo.Collection("test_role_results");
TestRoleResults.attachSchema(Schemas.TestRoleResult);
TestRoleResults.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestRoleResults.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

/**
 * ============================================================================
 * Test step result - the result for a single user
 * ============================================================================
 */
Schemas.TestStepResult = new SimpleSchema({
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
  // Link to the test result via the staticId
  testResultId: {
    type: String
  },
  // Link to the test case step via the staticId
  testCaseStepId: {
    type: String
  }
});
TestStepResults = new Mongo.Collection("test_step_results");
TestStepResults.attachSchema(Schemas.TestStepResult);
TestStepResults.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestStepResults.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

