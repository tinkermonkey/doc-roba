/**
 * Template Helpers
 */
Template.single_route_snippet.helpers({
  width: function () {
    return DocTreeConfig.nodes.width * 3 + DocTreeConfig.nodes.xMargin;
  },
  height: function () {
    return DocTreeConfig.nodes.height + DocTreeConfig.nodes.yMargin;
  },
  scale: function () {
    return this.scale || 1;
  },
  xMargin: function () {
    return DocTreeConfig.nodes.xMargin / 2;
  },
  yMargin: function () {
    return DocTreeConfig.nodes.yMargin / 2;
  },
  routeNodeX: function () {
    return DocTreeConfig.nodes.width * 2;
  },
  path: function (action) {
    var startY  = DocTreeConfig.nodes.height / 2,
      startX  = DocTreeConfig.nodes.width + 2,
      endX    = DocTreeConfig.nodes.width * 2 - 6;

    return PathBuilder.start()
      .M(startX, startY)
      .L(endX, startY)
      .compile();
  }
});

/**
 * Template Helpers
 */
Template.single_route_snippet.events({});

/**
 * Template Rendered
 */
Template.single_route_snippet.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.single_route_snippet.destroyed = function () {

};
