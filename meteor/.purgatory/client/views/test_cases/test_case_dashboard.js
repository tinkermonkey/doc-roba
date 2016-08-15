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
    return FlowRouter.getQueryParam("testCaseId")
  },
  testCase: function () {
    var testCaseId = FlowRouter.getQueryParam("testCaseId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    if(testCaseId && projectVersionId){
      return Collections.TestCases.findOne(testCaseId);
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
    var projectId = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    
    instance.subscribe("test_groups", projectId, projectVersionId);
    instance.subscribe("test_cases", projectId, projectVersionId);
    instance.subscribe("actions", projectId, projectVersionId);
    instance.subscribe("nodes", projectId, projectVersionId);

    // pull in the project and project version records
    instance.project.set(Collections.Projects.findOne(projectId));
    instance.version.set(Collections.ProjectVersions.findOne(projectVersionId));
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
