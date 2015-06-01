/**
 * Template Helpers
 */
Template.project_dashboard.helpers({
});

/**
 * Event Handlers
 */
Template.project_dashboard.events({

});

/**
 * Template Rendered
 */
Template.project_dashboard.rendered = function(){
  // Wire in the tabs
  Tabs.init(Template.instance());
};
