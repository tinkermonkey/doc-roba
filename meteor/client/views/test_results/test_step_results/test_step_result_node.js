/**
 * Template Helpers
 */
Template.TestStepResultNode.helpers({
  nodeContext: function () {
    var logContext = LogMessages.findOne({"context.testStepResultId": this._id, sender:"context", "data.type": "node"});
    if(logContext && logContext.data.length){
      return logContext.data[0].data
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestStepResultNode.events({});

/**
 * Template Created
 */
Template.TestStepResultNode.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestStepResultNode.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestStepResultNode.destroyed = function () {
  
};
