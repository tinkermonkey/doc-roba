/**
 * Template Helpers
 */
Template.VersionHome.helpers({
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
Template.VersionHome.events({});

/**
 * Template Created
 */
Template.VersionHome.created = function () {
  var instance = this;
  instance.project = new ReactiveVar();
  instance.version = new ReactiveVar();

  instance.autorun(function () {
    var route = Router.current();
    instance.subscribe("nodes", route.params.projectId, route.params._id);
    instance.subscribe("actions", route.params.projectId, route.params._id);
    instance.subscribe("data_stores", route.params.projectId, route.params._id);// TODO: Move to lower level template
    instance.subscribe("all_data_store_fields", route.params.projectId, route.params._id);// TODO: Move to lower level template
    instance.subscribe("all_data_store_rows", route.params.projectId, route.params._id);// TODO: Move to lower level template
    instance.subscribe("servers", route.params.projectId, route.params._id);// TODO: Move to lower level template
    instance.subscribe("test_systems", route.params.projectId, route.params._id);// TODO: Move to lower level template
    instance.subscribe("test_agents", route.params.projectId, route.params._id);// TODO: Move to lower level template

    // pull in the project and project version records
    instance.project.set(Collections.Projects.findOne(route.params.projectId));
    instance.version.set(Collections.ProjectVersions.findOne(route.params._id));
  });
};

/**
 * Template Rendered
 */
Template.VersionHome.rendered = function () {
  var instance = this;

  instance.autorun(function () {
    var ready = instance.subscriptionsReady(),
        version = instance.version.get();
    if(ready && version){
      Tabs.init(instance);
    }
  });
};

/**
 * Template Destroyed
 */
Template.VersionHome.destroyed = function () {
  
};
