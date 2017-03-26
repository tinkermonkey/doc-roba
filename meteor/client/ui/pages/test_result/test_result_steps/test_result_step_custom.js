import './test_result_step_custom.html';
import { Template } from 'meteor/templating';
let Prism = require('prismjs');

/**
 * Template Helpers
 */
Template.TestResultStepCustom.helpers({});

/**
 * Template Event Handlers
 */
Template.TestResultStepCustom.events({});

/**
 * Template Created
 */
Template.TestResultStepCustom.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.TestResultStepCustom.onRendered(() => {
  let instance = Template.instance();
  
  // Watch for data changes and re-render
  instance.autorun(function () {
    let data    = Template.currentData(),
        context = data.logContextMessage();

    if (context.data && context.data.length) {
      let stepData = context.data[0].data;
      if(stepData.data && stepData.data.code){
        instance.$('.code').html(Prism.highlight(stepData.data.code, Prism.languages.javascript));
      } else {
        console.error("TestResultStepCustom didn't find code in the step context:", context);
      }
    }
  });
});

/**
 * Template Destroyed
 */
Template.TestResultStepCustom.onDestroyed(() => {
  
});
