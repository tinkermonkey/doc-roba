/**
 * Template Helpers
 */
Template.ActionRouteSnippet.helpers({
  width: function () {
    return DocTreeConfig.nodes.width * 3 + DocTreeConfig.nodes.xMargin;
  },
  height: function () {
    return (DocTreeConfig.nodes.height + DocTreeConfig.nodes.yMargin) * this.routes.length * Math.min(2 / this.routes.length, 1);
  },
  scale: function () {
    return Math.min(2 / this.routes.length, 1);
  },
  xMargin: function () {
    return DocTreeConfig.nodes.xMargin / 2;
  },
  yMargin: function () {
    return DocTreeConfig.nodes.yMargin / 2;
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
 * Template Rendered
 */
Template.ActionRouteSnippet.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.ActionRouteSnippet.destroyed = function () {

};
