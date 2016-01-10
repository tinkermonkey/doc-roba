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

  instance.autorun(function () {
    var user = Meteor.user();
    console.log("BaseLayout: ", user);
    if(user && user.projectList){
      // Need to pass in the projectList to maintain reactivity
      instance.subscribe("user_peers", user.projectList);
      instance.subscribe("projects", user.projectList);
      instance.subscribe("project_versions", user.projectList);
      instance.subscribe("changes", user.projectList);
    }
  });
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
