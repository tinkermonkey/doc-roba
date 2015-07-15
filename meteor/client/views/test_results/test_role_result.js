/**
 * Template Helpers
 */
Template.TestRoleResult.helpers({
  resultWithRole: function () {
    this.testCaseRole = TestCaseRoles.findOne({staticId: this.testCaseRoleId, projectVersionId: this.projectVersionId});
    return this;
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
