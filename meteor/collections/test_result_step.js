/**
 * ============================================================================
 * Test step result - the result for a single user
 * ============================================================================
 */
Schemas.TestResultStep = new SimpleSchema({
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
  testResultRoleId: {
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
  // The result code
  resultCode: {
    type: Number,
    allowedValues: _.map(TestResultCodes, function (d) { return d; }),
    optional: true
  },
  // The result detail
  result: {
    type: Object,
    blackbox: true,
    optional: true
  }
});
TestResultSteps = new Mongo.Collection("test_result_steps");
TestResultSteps.attachSchema(Schemas.TestResultStep);
TestResultSteps.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated,
  remove: allowIfAuthenticated
});
TestResultSteps.deny({
  insert: allowIfTester,
  update: allowIfTester,
  remove: allowIfTester,
  fetch: ['projectId']
});
