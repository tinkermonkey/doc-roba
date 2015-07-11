/**
 * Template Helpers
 */
Template.VerticalRouteSnippet.helpers({
  width: function () {
    return DocTreeConfig.nodes.width * (this.scale || 1) + DocTreeConfig.standalone.margin * 2
  },
  height: function () {
    var height = 0;
    if(this.steps){
      // calculate the starting Y value for each step
      _.each(this.steps, function (step, i) {
        height += step.nodeId ? DocTreeConfig.nodes.height : 0;
        height += step.actionId ? DocTreeConfig.nodes.yMargin : 0;
      });
    }
    return height * (this.scale || 1) + DocTreeConfig.standalone.margin * 2
  },
  actionY: function () {
    return this.nodeId ? DocTreeConfig.nodes.height : 0
  },
  xMargin: function () {
    return DocTreeConfig.standalone.margin
  },
  yMargin: function () {
    return DocTreeConfig.standalone.margin
  },
  getScale: function () {
    return this.scale || 1
  },
  getSteps: function () {
    if(this.steps){
      // calculate the starting Y value for each step
      var startY = 0;
      _.each(this.steps, function (step, i) {
        step.startY = startY;
        startY += step.nodeId ? DocTreeConfig.nodes.height : 0;
        startY += step.actionId ? DocTreeConfig.nodes.yMargin : 0;
      });
      return this.steps
    }
  }
});

/**
 * Template Helpers
 */
Template.VerticalRouteSnippet.events({});

/**
 * Template Created
 */
Template.VerticalRouteSnippet.created = function () {};

/**
 * Template Rendered
 */
Template.VerticalRouteSnippet.rendered = function () {};

/**
 * Template Destroyed
 */
Template.VerticalRouteSnippet.destroyed = function () {

};
