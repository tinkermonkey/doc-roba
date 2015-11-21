/**
 * Template Helpers
 */
Template.TestResultRole.helpers({
});

/**
 * Template Event Handlers
 */
Template.TestResultRole.events({});

/**
 * Template Created
 */
Template.TestResultRole.created = function () {
  var instance = this,
    context = instance.data;
  instance.subscribe("test_system", context.projectId, context.projectVersionId, context.testSystemId);
  instance.subscribe("test_agent", context.projectId, context.projectVersionId, context.testAgentId);
};

/**
 * Template Rendered
 */
Template.TestResultRole.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.TestResultRole.destroyed = function () {
  
};
