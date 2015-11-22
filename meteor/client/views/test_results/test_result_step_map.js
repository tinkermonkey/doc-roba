/**
 * Template Helpers
 */
Template.TestResultStepMap.helpers({
  height: function () {
    var height = DocTreeConfig.nodes.height;
    if(this.data && this.type && this.type == "action"){
      height = DocTreeConfig.nodes.yMargin;
    }
    return height * (this.scale || 1) + DocTreeConfig.standalone.margin * 2
  },
  xMargin: function () {
    return DocTreeConfig.standalone.margin * 2
  },
  yMargin: function () {
    return DocTreeConfig.standalone.margin
  },
  isAction: function () {
    return this.type == "action"
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStepMap.events({});

/**
 * Template Created
 */
Template.TestResultStepMap.created = function () {
};

/**
 * Template Rendered
 */
Template.TestResultStepMap.rendered = function () {
};

/**
 * Template Destroyed
 */
Template.TestResultStepMap.destroyed = function () {
  
};
