import './test_case_step.html';

import {Template} from 'meteor/templating';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';

import {TestCaseStepTypes} from '../../../api/test_case/test_case_step_types.js';

import {Util} from '../../../api/util.js';
import {TestCaseSteps} from '../../../api/test_case/test_case_step.js';

import './step_types/test_case_step_action.js';
import './step_types/test_case_step_custom.js';
import './step_types/test_case_step_navigate.js';
import './step_types/test_case_step_node.js';
import './step_types/test_case_step_wait.js';

/**
 * Template Helpers
 */
Template.TestCaseStep.helpers({
  getStepTemplate: function () {
    switch (this.type) {
      case TestCaseStepTypes.node:
        return "TestCaseStepNode";
      case TestCaseStepTypes.action:
        return "TestCaseStepAction";
      case TestCaseStepTypes.navigate:
        return "TestCaseStepNavigate";
      case TestCaseStepTypes.wait:
        return "TestCaseStepWait";
      case TestCaseStepTypes.custom:
        return "TestCaseStepCustom";
    }
  },
  getStepClass: function () {
    return Util.testStepContainerClass(this.type, Template.instance().error.get());
  },
  stepContext: function () {
    this.error = Template.instance().error;
    return this;
  },
  error: function () {
    return Template.instance().error.get();
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseStep.events({
  "click .round-container-delete": function (e, instance) {
    var step = instance.data;
    if(step && step._id){
      e.stopImmediatePropagation();
      TestCaseSteps.remove(step._id, function (error) {
        if(error){
          console.error("Failed to delete test step: " + error.message);
          RobaDialog.error("Failed to delete test step: " + error.message);
        }
      });
    }
  },
  "edited .editable": function (e, instance, newValue) {
    e.stopImmediatePropagation();
    var testCaseStep = instance.data,
      dataKey = $(e.target).attr("data-key");

    if(testCaseStep){
      var stepData = testCaseStep.data || {};

      if(_.isObject(newValue)){
        stepData = _.extend(stepData, newValue)
      } else if(dataKey){
        stepData[dataKey] = newValue
      }

      console.log("TestCaseStep data update: ", stepData, newValue);
      TestCaseSteps.update(testCaseStep._id, {$set: {data: stepData}}, function (error) {
        if(error){
          console.error("Failed to update step: " + error.message);
          RobaDialog.error("Failed to update step: " + error.message);
        }
      });
    }
  },
  "click .test-case-step-error": function (e, instance) {
    var editable = instance.$(".editable");
    console.log("Editable: ", editable.get(0));
    $(e.target).closest(".test-case-step-body").addClass("hide");
    editable.parent(".hide").removeClass("hide");
  }
});

/**
 * Template Created
 */
Template.TestCaseStep.created = function () {
  var instance = this;
  instance.error = new ReactiveVar();
};

/**
 * Template Rendered
 */
Template.TestCaseStep.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestCaseStep.destroyed = function () {
  
};
