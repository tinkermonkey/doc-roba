/**
 * Template Helpers
 */
Template.TestCaseStep.helpers({
  getStepTemplate: function () {
    switch (this.type) {
      case TestCaseStepTypes.node:
        return "TestCaseStepNode";
      case TestCaseStepTypes.navigate:
        return "TestCaseStepNavigate";
      case TestCaseStepTypes.wait:
        return "TestCaseStepWait";
      case TestCaseStepTypes.custom:
        return "TestCaseStepCustom";
    }
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
  }
});

/**
 * Template Created
 */
Template.TestCaseStep.created = function () {
  
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
