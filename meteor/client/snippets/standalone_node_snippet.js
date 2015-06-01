/**
 * Template Helpers
 */
Template.standalone_node_snippet.helpers({
  width: function () {
    return (DocTreeConfig.nodes.width + DocTreeConfig.nodes.xMargin / 2) * (this.scale || 1);
  },
  height: function () {
    return (DocTreeConfig.nodes.height + DocTreeConfig.nodes.yMargin / 2) * (this.scale || 1);
  },
  xMargin: function () {
    return DocTreeConfig.nodes.xMargin / 4 * (this.scale || 1);
  },
  yMargin: function () {
    return DocTreeConfig.nodes.yMargin / 4 * (this.scale || 1);
  },
  getScale: function () {
    return this.scale || 1;
  }
});

/**
 * Template Helpers
 */
Template.standalone_node_snippet.events({});

/**
 * Template Rendered
 */
Template.standalone_node_snippet.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.standalone_node_snippet.destroyed = function () {

};
