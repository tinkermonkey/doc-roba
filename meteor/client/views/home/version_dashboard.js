/**
 * Template Helpers
 */
Template.version_dashboard.helpers({
});

/**
 * Event Handlers
 */
Template.version_dashboard.events({

});

/**
 * Template Rendered
 */
Template.version_dashboard.rendered = function(){
  // Wire in the tabs
  Tabs.init(Template.instance());
};
