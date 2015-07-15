/**
 * Template Helpers
 */
Template.TestResult.helpers({
  resultWithCase: function () {
    this.testCase = TestCases.findOne({projectVersionId: this.projectVersionId, staticId: this.testCaseId});
    return this;
  },
  roleResults: function () {
    return TestRoleResults.find({testResultId: this._id});
  }
});

/**
 * Template Event Handlers
 */
Template.TestResult.events({});

/**
 * Template Created
 */
Template.TestResult.created = function () {
  var instance = this;
  instance.subscribe("test_case", instance.data.projectId, instance.data.projectVersionId, instance.data.testCaseId);
  instance.subscribe("test_case_roles", instance.data.projectId, instance.data.projectVersionId, instance.data.testCaseId);
  instance.subscribe("test_case_steps", instance.data.projectId, instance.data.projectVersionId, instance.data.testCaseId);
};

/**
 * Template Rendered
 */
Template.TestResult.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestResult.destroyed = function () {
  
};
