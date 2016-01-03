/**
 * Template Helpers
 */
Template.ProjectHome.helpers({
  project: function () {
    return Template.instance().project.get()
  }
});

/**
 * Template Event Handlers
 */
Template.ProjectHome.events({});

/**
 * Template Created
 */
Template.ProjectHome.created = function () {
  var instance = this;
  instance.project = new ReactiveVar();

  instance.autorun(function () {
    var route = Router.current();

    // pull in the project and project version records
    instance.project.set(Collections.Projects.findOne(route.params.projectId));
  });
};

/**
 * Template Rendered
 */
Template.ProjectHome.rendered = function () {
  var instance = this;

  instance.autorun(function () {
    var ready = instance.subscriptionsReady(),
        project = instance.project.get();
    if(ready && project){
      Tabs.init(instance);
    }
  });
};

/**
 * Template Destroyed
 */
Template.ProjectHome.destroyed = function () {
  
};
