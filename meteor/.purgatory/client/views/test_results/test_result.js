/**
 * Template Helpers
 */
Template.TestResult.helpers({
  testResult: function () {
    return Template.instance().testResult.get()
  },
  testCase: function () {
    return Template.instance().testCase.get()
  },
  roleResults: function () {
    return TestResultRoles.find({testResultId: FlowRouter.getParam("testResultId")});
  }
});

/**
 * Template Event Handlers
 */
Template.TestResult.events({});

/**
 * Template Created
 */
Template.TestResult.created = function () {
  var instance = this;
  instance.testResult = new ReactiveVar();
  instance.testCase = new ReactiveVar();

  // Load the test result record
  instance.autorun(function () {
    var projectId = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId"),
        testResultId = FlowRouter.getParam("testResultId");

    instance.subscribe("test_result", projectId, testResultId, function () {
      var testResult = TestResults.findOne(testResultId);
      if(testResult){
        instance.testResult.set(testResult);
        instance.subscribe("test_case",       projectId, projectVersionId, testResult.testCaseId);
        instance.subscribe("test_case_roles", projectId, projectVersionId, testResult.testCaseId);
        instance.subscribe("test_case_steps", projectId, projectVersionId, testResult.testCaseId);
        instance.subscribe("server",          projectId, projectVersionId, testResult.serverId);
      } else {
        Dialog.error("Test result not found");
      }
    });
    instance.subscribe("test_result_roles",       projectId, testResultId);
    instance.subscribe("test_result_steps",       projectId, testResultId);
    instance.subscribe("test_result_screenshots", projectId, testResultId);
    instance.subscribe("test_result_log",         projectId, testResultId);
  });

  instance.autorun(function () {
    if(instance.subscriptionsReady()){
      var testResult = instance.testResult.get();
      var testCase = TestCases.findOne({
        staticId: testResult.testCaseId,
        projectVersionId: testResult.projectVersionId});
      instance.testCase.set(testCase);
    }
  });
};

/**
 * Template Rendered
 */
Template.TestResult.rendered = function () {
};

/**
 * Template Destroyed
 */
Template.TestResult.destroyed = function () {
  
};
