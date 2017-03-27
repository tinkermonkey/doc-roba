import './test_result.html';
import './test_result.css';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { TestCases } from '../../../../imports/api/test_cases/test_cases.js';
import { TestResults } from '../../../../imports/api/test_results/test_results.js';
import { TestResultRoles } from '../../../../imports/api/test_results/test_result_roles.js';
import '../../components/nav_menus/test_result_nav/test_result_nav.html';
import './test_result_role.js';

/**
 * Template Helpers
 */
Template.TestResult.helpers({
  /**
   * Get the TestResult record
   * @return TestResult
   */
  testResult() {
    let testResultId = FlowRouter.getParam("testResultId");
    if (testResultId) {
      return TestResults.findOne(testResultId);
    }
  },
  /**
   * Use a reactive variable to avoid repeated lookups in the TestCases collection
   */
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
  instance.testCaseId = new ReactiveVar();
  instance.testCase   = new ReactiveVar();
  
  // Load the test result record
  instance.autorun(function () {
    let projectId        = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId"),
        testResultId     = FlowRouter.getParam("testResultId");
    
    instance.subscribe("test_result", projectId, testResultId, function () {
      let testResult = TestResults.findOne(testResultId);
      if (testResult) {
        instance.testCaseId.set(testResult.testCaseId);
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
    instance.subscribe("test_result_step_waits", projectId, testResultId);
  });
  
  // Load the TestCase record if the TestCaseId changes
  instance.autorun(function () {
    let testCaseId       = instance.testCaseId.get(),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    if (testCaseId && projectVersionId) {
      instance.testCase.set(TestCases.findOne({
        staticId        : testCaseId,
        projectVersionId: projectVersionId
      }));
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
