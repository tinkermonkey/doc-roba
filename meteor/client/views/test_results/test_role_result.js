/**
 * Template Helpers
 */
Template.TestRoleResult.helpers({
  resultWithRole: function () {
    this.testCaseRole = TestCaseRoles.findOne({staticId: this.testCaseRoleId, projectVersionId: this.projectVersionId});
    return this;
  },
  stepResults: function () {
    return TestStepResults.find({testRoleResultId: this._id}, {sort: {order: 1}});
  }
});

/**
 * Template Event Handlers
 */
Template.TestRoleResult.events({});

/**
 * Template Created
 */
Template.TestRoleResult.created = function () {
  var instance = this;
  instance.subscribe("test_system", instance.data.projectId, instance.data.projectVersionId, instance.data.testSystemId);
  instance.subscribe("test_agent", instance.data.projectId, instance.data.projectVersionId, instance.data.testAgentId);
};

/**
 * Template Rendered
 */
Template.TestRoleResult.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestRoleResult.destroyed = function () {
  
};
