/**
 * Template Helpers
 */
Template.StandaloneNodeSnippet.helpers({
  width: function () {
    return DocTreeConfig.nodes.width * (this.scale || 1) + DocTreeConfig.standalone.margin * 2;
  },
  height: function () {
    return DocTreeConfig.nodes.height * (this.scale || 1) + DocTreeConfig.standalone.margin * 2;
  },
  margin: function () {
    return DocTreeConfig.standalone.margin;
  },
  getScale: function () {
    return this.scale || 1;
  }
});

/**
 * Template Helpers
 */
Template.StandaloneNodeSnippet.events({});

/**
 * Template Rendered
 */
Template.StandaloneNodeSnippet.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.StandaloneNodeSnippet.destroyed = function () {

};
