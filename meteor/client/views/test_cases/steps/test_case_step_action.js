/**
 * Template Helpers
 */
Template.TestCaseStepAction.helpers({
  nodeId: function () {
    var instance = Template.instance();
    return instance.nodeId.get()
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseStepAction.events({
});

/**
 * Template Created
 */
Template.TestCaseStepAction.created = function () {
  var instance = this;
  instance.nodeId = new ReactiveVar();
  instance.destinationNode = new ReactiveVar();
  instance.route = new ReactiveVar();

  instance.autorun(function () {
    var data = Template.currentData(),
      sourceStep = Collections.TestCaseSteps.findOne({
        testCaseRoleId: data.testCaseRoleId,
        order: {$lt: data.order},
        type: {$in: [TestCaseStepTypes.node, TestCaseStepTypes.action]}
      }, {sort: {order: -1}}),
      stepData = data.data;

    data.error.set();

    if(sourceStep && sourceStep.data){
      instance.nodeId.set(sourceStep.data.nodeId);

      // if there's a value for this step, validate that the action is available on the node present
      if(stepData && stepData.actionId && sourceStep.data.nodeId){
        var action = Collections.Actions.findOne({staticId: stepData.actionId, projectVersionId: data.projectVersionId}),
          node = Collections.Nodes.findOne({staticId: sourceStep.data.nodeId, projectVersionId: data.projectVersionId});
        if(action){
          if(!(action.nodeId == sourceStep.data.nodeId || _.contains(node.navMenus, action.nodeId))){
            data.error.set("This action specified is not available on the current node");
          }
        } else {
          data.error.set("This action specified could not be found");
        }
      }
    } else {
      instance.nodeId.set();
      data.error.set("This step must follow a node or action step");
    }
  });
};

/**
 * Template Rendered
 */
Template.TestCaseStepAction.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestCaseStepAction.destroyed = function () {
  
};
