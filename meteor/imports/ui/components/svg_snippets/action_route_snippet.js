/**
 * Template Helpers
 */
Template.ActionRouteSnippet.helpers({
  width: function () {
    var scale = Template.instance().scale.get();
    return DocTreeConfig.nodes.width * 3 * scale + DocTreeConfig.standalone.margin * 2;
  },
  height: function () {
    var scale = Template.instance().scale.get();
    return (DocTreeConfig.nodes.height * this.routes.length + DocTreeConfig.nodes.yMargin / 2 * (this.routes.length - 1)) * scale + DocTreeConfig.standalone.margin * 2;
  },
  scale: function () {
    return Template.instance().scale.get();
  },
  xMargin: function () {
    return DocTreeConfig.standalone.margin;
  },
  yMargin: function () {
    return DocTreeConfig.standalone.margin;
  },
  sourceNodeY: function sourceNodeY() {
    var height = this.routes.length * DocTreeConfig.nodes.height + (this.routes.length - 1) * DocTreeConfig.nodes.yMargin / 2;
    return (height / 2) - (DocTreeConfig.nodes.height / 2);
  },
  sortedRoutes: function () {
    return _.sortBy(this.routes, function (r) { return r.order });
  },
  routeNodeX: function () {
    return DocTreeConfig.nodes.width * 2;
  },
  routeNodeY: function () {
    return DocTreeConfig.nodes.height * this.order + DocTreeConfig.nodes.yMargin / 2 * this.order;
  },
  path: function (action) {
    var height = action.routes.length * DocTreeConfig.nodes.height + (action.routes.length - 1) * DocTreeConfig.nodes.yMargin / 2,
      startY  = height / 2,
      endY    = (this.order + 0.5) * DocTreeConfig.nodes.height + this.order * DocTreeConfig.nodes.yMargin / 2,
      startX  = DocTreeConfig.nodes.width + 1,
      endX    = DocTreeConfig.nodes.width * 2 - 4;

    return PathBuilder.start()
      .M(startX, startY)
      .C((startX + endX) / 2, startY, (startX + endX) / 2, endY, endX, endY)
      .compile();
  }
});

/**
 * Template Helpers
 */
Template.ActionRouteSnippet.events({});

/**
 * Template Created
 */
Template.ActionRouteSnippet.created = function () {
  this.scale = new ReactiveVar(this.data.scale || Math.min(2 / this.data.routes.length, 1));
};

/**
 * Template Rendered
 */
Template.ActionRouteSnippet.rendered = function () {
  var instance = Template.instance();

  // react to a route being added
  Template.instance().autorun(function () {
    var data = Template.currentData(),
      currentScale = instance.scale.get(),
      scale = data.scale || Math.min(1 / data.routes.length, 0.333);
    if(scale !== currentScale){
      instance.scale.set(scale)
    }
  });
};

/**
 * Template Destroyed
 */
Template.ActionRouteSnippet.destroyed = function () {

};
