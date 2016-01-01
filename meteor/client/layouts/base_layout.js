/**
 * Template Helpers
 */
Template.BaseLayout.helpers({
});

/**
 * Template Event Handlers
 */
Template.BaseLayout.events({});

/**
 * Template Created
 */
Template.BaseLayout.created = function () {
  var instance = this;
  instance.subscribe("user_data");
  instance.subscribe("user_peers");
  instance.subscribe("projects");
  instance.subscribe("project_versions");
  instance.subscribe("changes");
};

/**
 * Template Rendered
 */
Template.BaseLayout.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.BaseLayout.destroyed = function () {
  
};
