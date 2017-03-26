import './test_result_step_map.html';
import { Template } from 'meteor/templating';
import { TestCaseStepTypes } from '../../../../imports/api/test_cases/test_case_step_types.js';
import '../../components/svg_snippets/vertical_route_snippet.js';

/**
 * Template Helpers
 */
Template.TestResultStepMap.helpers({
  getMapSteps(){
    let steps = [];
    
    // Convert the contexts from the log into the format expected by the VerticalRouteSnippet
    this.testMapContexts().forEach((context) => {
      switch (context.type) {
        case "node":
          steps.push({
            node: context.data
          });
          break;
        case "action":
          steps.push({
            action: context.data.action
          });
          break;
        default:
          console.error('getMapSteps encountered an unknow context type:', context.type, context);
      }
    });
    
    return steps
  },
  hideLastNode(){
    return this.type === TestCaseStepTypes.navigate
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStepMap.events({});

/**
 * Template Created
 */
Template.TestResultStepMap.onCreated(() => {
});

/**
 * Template Rendered
 */
Template.TestResultStepMap.onRendered(() => {
});

/**
 * Template Destroyed
 */
Template.TestResultStepMap.onDestroyed(() => {
  
});
