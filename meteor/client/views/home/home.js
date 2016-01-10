/**
 * Template Helpers
 */
Template.Home.helpers({
  showProjectList: function () {
    var user = Meteor.user();
    return user.projectList.length > 1 || user.isSystemAdmin || Meteor.settings.allowPersonalProjects;
  }
});

/**
 * Event Handlers
 */
Template.Home.events({

});

/**
 * Template Created
 */
Template.Home.created = function(){
};

/**
 * Template Rendered
 */
Template.Home.rendered = function(){
};
