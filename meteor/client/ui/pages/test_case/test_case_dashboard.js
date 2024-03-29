import './test_case_dashboard.html';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Projects } from '../../../../imports/api/projects/projects.js';
import { ProjectVersions } from '../../../../imports/api/projects/project_versions.js';
import { TestCases } from '../../../../imports/api/test_cases/test_cases.js';
import '../../components/page_headers/current_project_header.js';
import '../../components/nav_menus/test_case_nav/test_case_nav.js';
import './test_case.js';

/**
 * Template Helpers
 */
Template.TestCaseDashboard.helpers({
  project() {
    return Template.instance().project.get()
  },
  version() {
    return Template.instance().version.get()
  },
  testCaseId() {
    return FlowRouter.getQueryParam("testCaseId")
  },
  testCase() {
    var testCaseId       = FlowRouter.getQueryParam("testCaseId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    if (testCaseId && projectVersionId) {
      return TestCases.findOne(testCaseId);
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
  let instance     = Template.instance();
  instance.project = new ReactiveVar();
  instance.version = new ReactiveVar();
  
  instance.autorun(function () {
    var projectId        = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    
    instance.subscribe("test_groups", projectId, projectVersionId);
    instance.subscribe("test_cases", projectId, projectVersionId);
    instance.subscribe("actions", projectId, projectVersionId);
    instance.subscribe("nodes", projectId, projectVersionId);
    
    // pull in the project and project version records
    instance.project.set(Projects.findOne(projectId));
    instance.version.set(ProjectVersions.findOne(projectVersionId));
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
