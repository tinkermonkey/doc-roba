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

/**
 * ============================================================================
 * Test Run Template - A named template for a test run
 * ============================================================================
 */
Schemas.TestRunTemplate = new SimpleSchema({
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
  parentTemplateId: {
    type: String,
    optional: true
  },
  // Order if part of a larger test run
  order: {
    type: Number,
    optional: true
  },
  // Template Title
  title: {
    type: String
  },
  // Longer description of the test run template
  description: {
    type: String,
    optional: true
  },
  // Unique identifier for launching this test run programatically
  identifier: {
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
TestRunTemplates = new Mongo.Collection("test_run_templates");
TestRunTemplates.attachSchema(Schemas.TestRunTemplate);
TestRunTemplates.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestRunTemplates.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

/**
 * ============================================================================
 * Test Run Template Test - a test setup in a named run config
 * ============================================================================
 */
Schemas.TestRunTemplateItem = new SimpleSchema({
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
  // Link to the parent structure (template, stage) by staticId
  parentId: {
    type: String,
    denyUpdate: true
  },
  // Bind to the static Type constant
  type: {
    type: Number,
    allowedValues: _.map(TestRunTemplateItemTypes, function (d) { return d; })
  },
  // Item order
  order: {
    type: Number
  },
  // Item config
  config: {
    type: Object,
    blackbox: true
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
TestRunTemplateItems = new Mongo.Collection("test_run_template_items");
TestRunTemplateItems.attachSchema(Schemas.TestRunTemplateItem);
TestRunTemplateItems.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestRunTemplateItems.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

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
TestRuns = new Mongo.Collection("test_runs");
TestRuns.attachSchema(Schemas.TestRun);
TestRuns.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestRuns.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

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
  // Link to the test run
  testRunId: {
    type: String,
    denyUpdate: true,
    optional: true
  },
  // Link to the test case via the staticId
  testCaseId: {
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
  // The status
  status: {
    type: Number,
    allowedValues: _.map(TestResultStatus, function (d) { return d; }),
    defaultValue: TestResultStatus.staged
  },
  // Abort the test
  abort: {
    type: Boolean,
    defaultValue: false
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
  // Link to the test run
  testRunId: {
    type: String,
    denyUpdate: true,
    optional: true
  },
  // Link to the test result
  testResultId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test case role via the staticId
  testCaseRoleId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test system on which the adventure will execute
  testSystemId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test agent to execute this adventure with
  testAgentId: {
    type: String,
    denyUpdate: true
  },
  // The data context to operate in
  dataContext: {
    type: Object,
    blackbox: true,
    denyUpdate: true
  },
  // The process id for this adventure
  pid: {
    type: Number,
    optional: true
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
  // Link to the test run
  testRunId: {
    type: String,
    denyUpdate: true,
    optional: true
  },
  // Link to the test result
  testResultId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test role result
  testRoleResultId: {
    type: String,
    denyUpdate: true
  },
  // Link to the test case step via the staticId
  testCaseStepId: {
    type: String,
    denyUpdate: true
  },
  // The order to run this
  order: {
    type: Number,
    denyUpdate: true
  },
  // The type of test case step
  type: {
    type: Number,
    allowedValues: _.map(TestCaseStepTypes, function (d) { return d; }),
    denyUpdate: true
  },
  // The data from the test step (not the context from the test case run)
  data: {
    type: Object,
    blackbox: true,
    denyUpdate: true,
    optional: true
  },
  // The data context for this step
  dataContext: {
    type: Object,
    blackbox: true,
    denyUpdate: true,
    optional: true
  },
  // The status
  status: {
    type: Number,
    allowedValues: _.map(TestResultStatus, function (d) { return d; }),
    defaultValue: TestResultStatus.staged
  },
  // Various checks done during the course of the step
  checks: {
    type: Object,
    blackbox: true,
    optional: true
  },
  // The result
  result: {
    type: Number,
    allowedValues: _.map(TestResultCodes, function (d) { return d; }),
    optional: true
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

