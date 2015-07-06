/**
 * Template Helpers
 */
Template.TestCaseStepNode.helpers({
  getNodeId: function () {
    if(this.data){
      return this.data.nodeId
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseStepNode.events({
  "edited .editable": function (e, instance, newValue) {
    var testCaseStep = instance.data;
    e.stopImmediatePropagation();

    if(newValue && testCaseStep){
      var stepData = testCaseStep.data || {};
      stepData.nodeId = newValue;
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
Template.TestCaseStepNode.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestCaseStepNode.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestCaseStepNode.destroyed = function () {
  
};
