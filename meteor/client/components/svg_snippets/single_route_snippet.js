/**
 * Template Helpers
 */
Template.SingleRouteSnippet.helpers({
  width: function () {
    return DocTreeConfig.nodes.width * 3 + DocTreeConfig.standalone.margin * 2;
  },
  height: function () {
    return DocTreeConfig.nodes.height + DocTreeConfig.standalone.margin * 2;
  },
  scale: function () {
    return this.scale || 1;
  },
  xMargin: function () {
    var width = DocTreeConfig.nodes.width * 3 + DocTreeConfig.standalone.margin * 2;
    return (width - DocTreeConfig.nodes.width) / 2;
  },
  yMargin: function () {
    return DocTreeConfig.standalone.margin;
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
Template.SingleRouteSnippet.events({});

/**
 * Template Rendered
 */
Template.SingleRouteSnippet.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.SingleRouteSnippet.destroyed = function () {

};
