/**
 * Template Helpers
 */
Template.TestCaseDashboard.helpers({
  project: function () {
    return Template.instance().project.get()
  },
  version: function () {
    return Template.instance().version.get()
  },
  testCaseId: function () {
    return Router.current().params.query ? Router.current().params.query.testCaseId : null
  },
  testCase: function () {
    var query = Router.current().params.query;
    if(query.testCaseId){
      return Collections.TestCases.findOne(query.testCaseId);
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseDashboard.events({});

/**
 * Template Created
 */
Template.TestCaseDashboard.created = function () {
  var instance = this;
  instance.project = new ReactiveVar();
  instance.version = new ReactiveVar();

  instance.autorun(function () {
    var route = Router.current();
    console.log("TestCaseDashboard:", route);
    instance.subscribe("test_groups", route.params.projectId, route.params._id);
    instance.subscribe("test_cases", route.params.projectId, route.params._id);
    instance.subscribe("nodes", route.params.projectId, route.params._id);
    instance.subscribe("actions", route.params.projectId, route.params._id);
    instance.subscribe("data_stores", route.params.projectId, route.params._id);
    instance.subscribe("all_data_store_fields", route.params.projectId, route.params._id);
    instance.subscribe("all_data_store_rows", route.params.projectId, route.params._id);

    // TODO: these should be moved to sub-templates
    instance.subscribe("servers", route.params.projectId, route.params._id);
    instance.subscribe("test_systems", route.params.projectId, route.params._id);
    instance.subscribe("test_agents", route.params.projectId, route.params._id)

    // pull in the project and project version records
    instance.project.set(Collections.Projects.findOne(route.params.projectId));
    instance.version.set(Collections.ProjectVersions.findOne(route.params._id));
  });
};

/**
 * Template Rendered
 */
Template.TestCaseDashboard.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.TestCaseDashboard.destroyed = function () {
  
};
