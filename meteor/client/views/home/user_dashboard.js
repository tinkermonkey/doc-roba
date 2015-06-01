/**
 * Template Helpers
 */
Template.user_dashboard.helpers({
});

/**
 * Event Handlers
 */
Template.user_dashboard.events({

});

/**
 * Template Rendered
 */
Template.user_dashboard.rendered = function(){
  // Wire in the tabs
  Tabs.init(Template.instance());
};
