/**
 * Template Helpers
 */
Template.CurrentProjectNav.helpers({
  project: function () {
    return Template.instance().project.get()
  },
  version: function () {
    return Template.instance().version.get()
  }
});

/**
 * Template Event Handlers
 */
Template.CurrentProjectNav.events({});

/**
 * Template Created
 */
Template.CurrentProjectNav.created = function () {
  var instance = this;
  instance.project = new ReactiveVar();
  instance.version = new ReactiveVar();

  instance.autorun(function () {
    var route = Router.current();
    if(route.params.projectId){
      instance.project.set(Collections.Projects.findOne(route.params.projectId));
    }
    if(route.params.projectVersionId){
      instance.version.set(Collections.ProjectVersions.findOne(route.params.projectVersionId));
    }
  });

};

/**
 * Template Rendered
 */
Template.CurrentProjectNav.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.CurrentProjectNav.destroyed = function () {
  
};
