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
  },
  getRoleLogMessages: function () {
    return LogMessages.find({"context.testRoleResultId": this._id}, {sort: {time: 1}});
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
  console.log("TestRoleResult.created: ", Date.now());
};

/**
 * Template Rendered
 */
Template.TestRoleResult.rendered = function () {
  console.log("TestRoleResult.rendered: ", Date.now());
  var instance = this;
  instance.autorun(function () {
    var data = Template.currentData(),
      stepMap = { list: [] },
      computeStart = Date.now();
    LogMessages.find({
      "context.testRoleResultId": data._id,
      sender: "context",
      "data.type": "step"
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
          stepId: stepContext.data[0].data._id
        });
      } else {
        Meteor.log.error("Step Context without step data: " + JSON.stringify(stepContext));
      }
    });
    // get the time of the last message
    stepMap.list[stepMap.list.length - 1].endTime = LogMessages.findOne({
      "context.testRoleResultId": data._id
    }, {sort: {time: -1}}).time;

    // Create a map by id for places without a reliable index value
    _.each(stepMap.list, function (mapItem) {
      stepMap[mapItem.stepId] = mapItem;
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
