/**
 * Template Helpers
 */
Template.TestResultStepNode.helpers({
  nodeContext: function () {
    var logContext = LogMessages.findOne({"context.testResultStepId": this.step._id, sender:"context", "data.type": "node"});
    if(logContext && logContext.data.length){
      return logContext.data[0].data
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStepNode.events({});

/**
 * Template Created
 */
Template.TestResultStepNode.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestResultStepNode.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestResultStepNode.destroyed = function () {
  
};
