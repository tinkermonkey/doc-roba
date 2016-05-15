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
      Collections.TestCaseSteps.remove(step._id, function (error) {
        if(error){
          console.error("Failed to delete test step: " + error.message);
          Dialog.error("Failed to delete test step: " + error.message);
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
      Collections.TestCaseSteps.update(testCaseStep._id, {$set: {data: stepData}}, function (error) {
        if(error){
          console.error("Failed to update step: " + error.message);
          Dialog.error("Failed to update step: " + error.message);
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
