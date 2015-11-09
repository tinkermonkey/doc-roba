/**
 * ============================================================================
 * Test role result - the result for a single user
 * ============================================================================
 */
Schemas.TestResultRole = new SimpleSchema({
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
  // Link to the account to use
  accountId: {
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
TestResultRoles = new Mongo.Collection("test_result_roles");
TestResultRoles.attachSchema(Schemas.TestResultRole);
TestResultRoles.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestResultRoles.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});

/**
 * Helpers
 */
TestResultRoles.helpers({
  role: function () {
    return TestCaseRoles.findOne({staticId: this.testCaseRoleId, projectVersionId: this.projectVersionId});
  },
  testSystem: function () {
    return TestSystems.findOne({staticId: this.testSystemId, projectVersionId: this.projectVersionId});
  },
  testAgent: function () {
    return TestAgents.findOne({staticId: this.testAgentId, projectVersionId: this.projectVersionId});
  }
});