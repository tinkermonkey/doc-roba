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
  "click .test-case-step-delete": function (e, instance) {
    var step = this;

    if(step){
      TestCaseSteps.remove(step._id, function (error) {
        if(error){
          Meteor.log.error("Failed to delete test step: " + error.message);
          Dialog.error("Failed to delete test step: " + error.message);
        }
      });
    }
  },
  "edited .editable": function (e, instance, newValue) {
    var testCaseStep = instance.data,
      dataKey = $(e.target).attr("data-key");
    e.stopImmediatePropagation();

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
          Meteor.log.error("Failed to update step: " + error.message);
          Dialog.error("Failed to update step: " + error.message);
        }
      });
    }
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