/**
 * Template Helpers
 */
Template.node_snippet.helpers({
  isPage: function () {
    return this.type == NodeTypes.page;
  },
  isView: function () {
    return this.type == NodeTypes.view;
  },
  titleY: function () {
    return DocTreeConfig.nodes.titleHeight + DocTreeConfig.nodes.borderWidth;
  }
});

/**
 * Template Helpers
 */
Template.node_snippet.events({});

/**
 * Template Rendered
 */
Template.node_snippet.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.node_snippet.destroyed = function () {

};
