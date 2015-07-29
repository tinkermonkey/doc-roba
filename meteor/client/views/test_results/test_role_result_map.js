/**
 * Template Helpers
 */
Template.TestRoleResultMap.helpers({
  height: function () {
    var height = 0;
    var steps = Template.instance().steps.get();
    if(steps){
      // calculate the starting Y value for each step
      _.each(steps, function (step, i) {
        height += step.node ? DocTreeConfig.nodes.height : 0;
        height += step.action ? DocTreeConfig.nodes.yMargin : 0;
      });
    }
    return height * (this.scale || 1) + DocTreeConfig.standalone.margin * 2
  },
  actionY: function () {
    return this.node ? DocTreeConfig.nodes.height : 0
  },
  xMargin: function () {
    return DocTreeConfig.standalone.margin * 2
  },
  yMargin: function () {
    return DocTreeConfig.standalone.margin
  },
  getSteps: function () {
    var steps = Template.instance().steps.get();
    if(steps && steps.length){
      // calculate the starting Y value for each step
      var startY = 0;
      _.each(steps, function (step, i) {
        step.startY = startY;
        startY += step.node ? DocTreeConfig.nodes.height : 0;
        startY += step.action ? DocTreeConfig.nodes.yMargin : 0;
      });
      return steps
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestRoleResultMap.events({});

/**
 * Template Created
 */
Template.TestRoleResultMap.created = function () {
  var instance = this;
  instance.steps = new ReactiveVar([]);
};

/**
 * Template Rendered
 */
Template.TestRoleResultMap.rendered = function () {
  var instance = this;

  // for the data binding we just need to setup an update call
  instance.autorun(function () {
    var data = Template.currentData(),
      startTime = Date.now();
    Meteor.log.debug("Auto-run executing ResultMap: ", data.testRoleResult._id);

    // Get the log messages and scrub nodes and actions from them
    var parentId = null,
      nodes = [],
      actions = [],
      steps = [],
      messages = LogMessages.find({
      "context.testRoleResultId": data.testRoleResult._id,
      "sender": "context",
      "data.type": {$in: ["node", "action"]}
    }, {sort: {time: 1}}).forEach(function (message, i) {
        if(message.data[0].type == "node"){
          // use a fake parentId (the previous node's id) to build of the hierarchy
          var node = message.data[0].data;
          node.parentId = parentId;
          node.order = i;
          nodes.push(node);
          parentId = node.staticId;
        } else {
          // catalog the actions
          actions.push(message.data[0].data.action);
        }
      });

    // stitch everything together as steps
    _.each(nodes, function (node, i) {
      steps.push({
        node: node,
        action: i < actions.length ? actions[i] : null
      });
    });

    console.log("ResultMap Data: ", Date.now() - startTime, steps);
    instance.steps.set(steps);
  });
};

/**
 * Template Destroyed
 */
Template.TestRoleResultMap.destroyed = function () {
  
};
