/**
 * Template Helpers
 */
Template.TestRunTemplateDashboard.helpers({
  project: function () {
    return Template.instance().project.get()
  },
  version: function () {
    return Template.instance().version.get()
  },
  testRunTemplateId: function () {
    return Router.current().params.query ? Router.current().params.query.testRunTemplateId : null
  },
  testRunTemplate: function () {
    var query = Router.current().params.query;
    if(query.testRunTemplateId){
      return Collections.TestRunTemplates.findOne(query.testRunTemplateId);
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestRunTemplateDashboard.events({});

/**
 * Template Created
 */
Template.TestRunTemplateDashboard.created = function () {
  var instance = this;
  instance.project = new ReactiveVar();
  instance.version = new ReactiveVar();

  instance.autorun(function () {
    var route = Router.current();
    instance.subscribe("test_cases", route.params.projectId, route.params.projectVersionId);
    instance.subscribe("test_groups", route.params.projectId, route.params.projectVersionId);
    instance.subscribe("test_run_templates", route.params.projectId, route.params.projectVersionId);
    instance.subscribe("test_run_template_items", route.params.projectId, route.params.projectVersionId);

    // pull in the project and project version records
    instance.project.set(Collections.Projects.findOne(route.params.projectId));
    instance.version.set(Collections.ProjectVersions.findOne(route.params.projectVersionId));
  });
};

/**
 * Template Rendered
 */
Template.TestRunTemplateDashboard.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.TestRunTemplateDashboard.destroyed = function () {
  
};
