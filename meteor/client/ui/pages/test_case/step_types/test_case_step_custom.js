import './test_case_step_custom.html';
import { Template } from 'meteor/templating';
import { TestCaseSteps } from '../../../../../imports/api/test_cases/test_case_steps.js';
import { TestCaseStepTypes } from '../../../../../imports/api/test_cases/test_case_step_types.js';

/**
 * Template Helpers
 */
Template.TestCaseStepCustom.helpers({});

/**
 * Template Event Handlers
 */
Template.TestCaseStepCustom.events({});

/**
 * Template Created
 */
Template.TestCaseStepCustom.created = function () {

};

/**
 * Template Rendered
 */
Template.TestCaseStepCustom.rendered = function () {
  let instance = Template.instance();
  instance.autorun(function () {
    let data           = Template.currentData(),
        previousStep   = TestCaseSteps.findOne({
          testCaseRoleId: data.testCaseRoleId,
          order         : { $lt: data.order }
        }, { sort: { order: -1 } }),
        allowableTypes = [
          TestCaseStepTypes.custom,
          TestCaseStepTypes.action,
          TestCaseStepTypes.node,
          TestCaseStepTypes.wait,
        ];
    
    if (!_.contains(allowableTypes, previousStep.type)) {
      data.error.set("This step requires a stable defined location")
    } else {
      data.error.set();
    }
  });
};

/**
 * Template Destroyed
 */
Template.TestCaseStepCustom.destroyed = function () {
  
};
