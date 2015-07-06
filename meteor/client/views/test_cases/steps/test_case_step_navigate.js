/**
 * Template Helpers
 */
Template.TestCaseStepNavigate.helpers({
  source: function () {
    var instance = Template.instance();
    return instance.sourceNode.get()
  },
  destination: function () {
    var instance = Template.instance();
    return instance.destinationNode.get()
  },
  complete: function () {
    var instance = Template.instance();
    return instance.sourceNode.get() && instance.destinationNode.get()
  },
  route: function () {
    var instance = Template.instance();
    return instance.route.get()
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseStepNavigate.events({});

/**
 * Template Created
 */
Template.TestCaseStepNavigate.created = function () {
  var instance = this;
  instance.sourceNode = new ReactiveVar();
  instance.destinationNode = new ReactiveVar();
  instance.route = new ReactiveVar();

  instance.autorun(function () {
    var data = Template.currentData(),
      sourceStep = TestCaseSteps.findOne({testCaseRoleId: data.testCaseRoleId, order: {$lt: data.order}}, {sort: {order: -1}}),
      destinationStep = TestCaseSteps.findOne({testCaseRoleId: data.testCaseRoleId, order: {$gt: data.order}}, {sort: {order: 1}});

    if(sourceStep && sourceStep.data){
      instance.sourceNode.set(sourceStep.data.nodeId);
    } else {
      instance.sourceNode.set();
    }

    if(destinationStep && destinationStep.data){
      instance.destinationNode.set(destinationStep.data.nodeId);
    } else {
      instance.destinationNode.set();
    }
  });
};

/**
 * Template Rendered
 */
Template.TestCaseStepNavigate.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestCaseStepNavigate.destroyed = function () {
  
};
