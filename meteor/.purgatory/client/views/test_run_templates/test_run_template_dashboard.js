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
    return FlowRouter.getQueryParam("testRunTemplateId")
  },
  testRunTemplate: function () {
    var testRunTemplateId = FlowRouter.getQueryParam("testRunTemplateId");
    if(testRunTemplateId){
      return Collections.TestRunTemplates.findOne(testRunTemplateId);
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
    var projectId = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");

    instance.subscribe("test_cases", projectId, projectVersionId);
    instance.subscribe("test_groups", projectId, projectVersionId);
    instance.subscribe("test_run_templates", projectId, projectVersionId);
    instance.subscribe("test_run_template_items", projectId, projectVersionId);

    // pull in the project and project version records
    instance.project.set(Collections.Projects.findOne(projectId));
    instance.version.set(Collections.ProjectVersions.findOne(projectVersionId));
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
