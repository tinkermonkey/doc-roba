import './test_plan_dashboard.html';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Projects } from '../../../api/project/project.js';
import { ProjectVersions } from '../../../api/project/project_version.js';
import { TestPlans } from '../../../api/test_plan/test_plan.js';
import '../../components/nav_menus/test_plan_nav/test_plan_nav.js';
import './test_plan.js';

/**
 * Template Helpers
 */
Template.TestPlanDashboard.helpers({
  project () {
    return Template.instance().project.get()
  },
  version () {
    return Template.instance().version.get()
  },
  testPlanId () {
    return FlowRouter.getQueryParam("testPlanId")
  },
  testPlan () {
    var testPlanId = FlowRouter.getQueryParam("testPlanId");
    if (testPlanId) {
      return TestPlans.findOne(testPlanId);
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestPlanDashboard.events({});

/**
 * Template Created
 */
Template.TestPlanDashboard.onCreated(() => {
  let instance     = Template.instance();
  instance.project = new ReactiveVar();
  instance.version = new ReactiveVar();
  
  instance.autorun(function () {
    var projectId        = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    
    instance.subscribe("test_cases", projectId, projectVersionId);
    instance.subscribe("test_groups", projectId, projectVersionId);
    instance.subscribe("test_plans", projectId, projectVersionId);
    instance.subscribe("test_plan_items", projectId, projectVersionId);
    
    // pull in the project and project version records
    instance.project.set(Projects.findOne(projectId));
    instance.version.set(ProjectVersions.findOne(projectVersionId));
  });
});

/**
 * Template Rendered
 */
Template.TestPlanDashboard.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TestPlanDashboard.onDestroyed(() => {
  
});
