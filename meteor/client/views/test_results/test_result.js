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
    return Collections.TestResultRoles.find({testResultId: Router.current().params.testResultId});
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
    var route = Router.current();
    instance.subscribe("test_result", route.params.projectId, route.params.testResultId, function () {
      var testResult = Collections.TestResults.findOne(route.params.testResultId);
      if(testResult){
        instance.testResult.set(testResult);
        instance.subscribe("test_case", testResult.projectId, testResult.projectVersionId, testResult.testCaseId);
        instance.subscribe("test_case_roles", testResult.projectId, testResult.projectVersionId, testResult.testCaseId);
        instance.subscribe("test_case_steps", testResult.projectId, testResult.projectVersionId, testResult.testCaseId);
        instance.subscribe("server", testResult.projectId, testResult.projectVersionId, testResult.serverId);
      } else {
        Dialog.error("Test Result not found");
      }
    });
    instance.subscribe("test_result_roles", route.params.projectId, route.params.testResultId);
    instance.subscribe("test_result_steps", route.params.projectId, route.params.testResultId);
    instance.subscribe("test_result_screenshots", route.params.projectId, route.params.testResultId);
    instance.subscribe("test_result_log", route.params.projectId, route.params.testResultId);
  });

  instance.autorun(function () {
    if(instance.subscriptionsReady()){
      var testResult = instance.testResult.get();
      var testCase = Collections.TestCases.findOne({staticId: testResult.testCaseId, projectVersionId: testResult.projectVersionId});
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
