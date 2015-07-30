/**
 * Template Helpers
 */
Template.TestRoleResult.helpers({
  resultWithRole: function () {
    this.testCaseRole = TestCaseRoles.findOne({staticId: this.testCaseRoleId, projectVersionId: this.projectVersionId});
    return this;
  },
  stepResults: function () {
    return TestStepResults.find({testRoleResultId: this._id}, {sort: {order: 1}});
  },
  getStepMap: function () {
    return Template.instance().stepMap.get()
  }
});

/**
 * Template Event Handlers
 */
Template.TestRoleResult.events({});

/**
 * Template Created
 */
Template.TestRoleResult.created = function () {
  var instance = this;
  instance.subscribe("test_system", instance.data.projectId, instance.data.projectVersionId, instance.data.testSystemId);
  instance.subscribe("test_agent", instance.data.projectId, instance.data.projectVersionId, instance.data.testAgentId);
  instance.stepMap = new ReactiveVar();

  // steps are rendering slowly (because of the log messages), so we want a spinner until they're complete
  instance.stepsRendered = new ReactiveVar(0);
};

/**
 * Template Rendered
 */
Template.TestRoleResult.rendered = function () {
  var instance = this;
  instance.autorun(function () {
    var data = Template.currentData(),
      stepMap = { list: [] },
      computeStart = Date.now();

    LogMessages.find({
      "sender": "context",
      "data.type": "step",
      "context.testRoleResultId": data._id
    }, {sort: {time: 1}}).forEach(function (stepContext, i) {
      if(stepContext.data[0].data){
        // update the previous step end time to this step's start time
        if(i > 0){
          stepMap.list[i-1].endTime = stepContext.time;
        }

        stepMap.list.push({
          order: i,
          startTime: i > 0 ? stepContext.time : 0,
          stepType: stepContext.data[0].data.type,
          stepId: stepContext.data[0].data._id,
          navigationSteps: []
        });
      } else {
        Meteor.log.error("Step Context without step data: " + JSON.stringify(stepContext));
      }
    });

    // get the time of the last message
    /*
    stepMap.list[stepMap.list.length - 1].endTime = LogMessages.findOne({
      "context.testRoleResultId": data._id
    }, {sort: {time: -1}}).time;
    */

    // Create a map by id for places without a reliable index value
    _.each(stepMap.list, function (mapItem) {
      stepMap[mapItem.stepId] = mapItem;
    });

    // now get the navigation steps for each step
    // Get the log messages and scrub nodes and actions from them
    var nodes = [],
      actions = [];

    LogMessages.find({
      "sender": "context",
      "data.type": {$in: ["node", "action"]},
      "context.testRoleResultId": data._id
    }, {sort: {time: 1}}).forEach(function (message, i) {
      if(message.data[0].type == "node"){
        // use a fake parentId (the previous node's id) to build of the hierarchy
        var node = message.data[0].data;
        node.stepId = message.context.testStepResultId;
        nodes.push(node);
      } else {
        // catalog the actions
        actions.push(message.data[0].data.action);
      }
    });

    // stitch everything together as steps
    _.each(nodes, function (node, i) {
      stepMap[node.stepId].navigationSteps.push({
        node: node,
        action: i < actions.length ? actions[i] : null
      });
    });

    console.log("StepMap compute time: ", Date.now() - computeStart, stepMap);
    instance.stepMap.set(stepMap);
  });
};

/**
 * Template Destroyed
 */
Template.TestRoleResult.destroyed = function () {
  
};
