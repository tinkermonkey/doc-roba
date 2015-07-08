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
  },
  routeError: function () {
    var instance = Template.instance();
    return instance.routeError.get()
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
  instance.routeError = new ReactiveVar();

  instance.autorun(function () {
    var data = Template.currentData(),
      sourceStep = TestCaseSteps.findOne({testCaseRoleId: data.testCaseRoleId, order: {$lt: data.order}}, {sort: {order: -1}}),
      destinationStep = TestCaseSteps.findOne({testCaseRoleId: data.testCaseRoleId, order: {$gt: data.order}}, {sort: {order: 1}}),
      sourceNode, destinationNode;

    if(sourceStep && sourceStep.data){
      instance.sourceNode.set(sourceStep.data.nodeId);
      sourceNode = sourceStep.data.nodeId
    } else {
      instance.sourceNode.set();
    }

    if(destinationStep && destinationStep.data){
      instance.destinationNode.set(destinationStep.data.nodeId);
      destinationNode = destinationStep.data.nodeId
    } else {
      instance.destinationNode.set();
    }

    // create the route
    instance.routeError.set();
    if(sourceNode && destinationNode){
      var sourceNodeRecord = Nodes.findOne({projectVersionId: data.projectVersionId, staticId: sourceNode}),
        destinationNodeRecord = Nodes.findOne({projectVersionId: data.projectVersionId, staticId: destinationNode});
      if(sourceNodeRecord && destinationNodeRecord){
        // ready to create the route
        try{
          var route = RobaRouter.nodeToNode(sourceNodeRecord, destinationNodeRecord);
          instance.route.set(route);
        } catch(e){
          instance.routeError.set("Route not found");
        }
      } else {
        instance.route.set();
      }
    } else {
      instance.route.set();
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
