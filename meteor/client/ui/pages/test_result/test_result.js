import './test_result.html';
import './test_result.css';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { TestCases } from '../../../../imports/api/test_cases/test_cases.js';
import { TestResults } from '../../../../imports/api/test_result/test_result.js';
import { TestResultRoles } from '../../../../imports/api/test_result/test_result_role.js';
import '../../components/nav_menus/test_result_nav/test_result_nav.html';
import './test_result_role.js';

/**
 * Template Helpers
 */
Template.TestResult.helpers({
  testResult() {
    return Template.instance().testResult.get()
  },
  testCase() {
    return Template.instance().testCase.get()
  },
  roleResults() {
    return TestResultRoles.find({ testResultId: FlowRouter.getParam("testResultId") });
  }
});

/**
 * Template Event Handlers
 */
Template.TestResult.events({});

/**
 * Template Created
 */
Template.TestResult.onCreated(() => {
  let instance        = Template.instance();
  instance.testResult = new ReactiveVar();
  instance.testCase   = new ReactiveVar();
  
  // Load the test result record
  instance.autorun(function () {
    var projectId        = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId"),
        testResultId     = FlowRouter.getParam("testResultId");
    
    instance.subscribe("test_result", projectId, testResultId, function () {
      var testResult = TestResults.findOne(testResultId);
      if (testResult) {
        instance.testResult.set(testResult);
        instance.subscribe("test_case", projectId, projectVersionId, testResult.testCaseId);
        instance.subscribe("test_case_roles", projectId, projectVersionId, testResult.testCaseId);
        instance.subscribe("test_case_steps", projectId, projectVersionId, testResult.testCaseId);
        instance.subscribe("test_server", projectId, projectVersionId, testResult.serverId);
      } else {
        RobaDialog.error("Test result not found");
      }
    });
    instance.subscribe("test_result_roles", projectId, testResultId);
    instance.subscribe("test_result_steps", projectId, testResultId);
    instance.subscribe("test_result_screenshots", projectId, testResultId);
    instance.subscribe("test_result_log", projectId, testResultId);
  });
  
  instance.autorun(function () {
    if (instance.subscriptionsReady()) {
      var testResult = instance.testResult.get();
      var testCase   = TestCases.findOne({
        staticId        : testResult.testCaseId,
        projectVersionId: testResult.projectVersionId
      });
      instance.testCase.set(testCase);
    }
  });
});

/**
 * Template Rendered
 */
Template.TestResult.onRendered(() => {
});

/**
 * Template Destroyed
 */
Template.TestResult.onDestroyed(() => {
  
});
