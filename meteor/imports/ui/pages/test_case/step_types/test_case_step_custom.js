import './test_case_step_custom.html';

import {Blaze} from 'meteor/blaze';
import {Template} from 'meteor/templating';

import {TestCaseSteps} from '../../../../api/test_case/test_case_step.js';
import {TestCaseStepTypes} from '../../../../api/test_case/test_case_step_types.js';

/**
 * Template Helpers
 */
Template.TestCaseStepCustom.helpers({
  hasCode: function () {
    return this.data && this.data.code && this.data.code.trim().length
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseStepCustom.events({

});

/**
 * Template Created
 */
Template.TestCaseStepCustom.created = function () {

};

/**
 * Template Rendered
 */
Template.TestCaseStepCustom.rendered = function () {
  var instance = this;
  instance.autorun(function () {
    var data = Template.currentData(),
      previousStep = TestCaseSteps.findOne({
        testCaseRoleId: data.testCaseRoleId,
        order: {$lt: data.order}
      }, {sort: {order: -1}}),
      allowableTypes = [
        TestCaseStepTypes.custom,
        TestCaseStepTypes.action,
        TestCaseStepTypes.node,
        TestCaseStepTypes.wait,
      ];

    if(!_.contains(allowableTypes, previousStep.type)){
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
