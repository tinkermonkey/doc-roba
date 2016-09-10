import './test_result_role.html';
import { Template } from 'meteor/templating';
import './test_result_step.js';

/**
 * Template Helpers
 */
Template.TestResultRole.helpers({});

/**
 * Template Event Handlers
 */
Template.TestResultRole.events({});

/**
 * Template Created
 */
Template.TestResultRole.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let data = Template.currentData();
    instance.subscribe("test_system", data.projectId, data.projectVersionId, data.testSystemId);
    instance.subscribe("test_agent", data.projectId, data.projectVersionId, data.testAgentId);
  });
});

/**
 * Template Rendered
 */
Template.TestResultRole.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TestResultRole.onDestroyed(() => {
  
});
