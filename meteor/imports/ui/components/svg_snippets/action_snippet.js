/**
 * Template Helpers
 */
Template.ActionSnippet.helpers({
  actionX: function () {
    return DocTreeConfig.nodes.width / 2
  },
  actionY: function () {
    return DocTreeConfig.nodes.yMargin - DocTreeConfig.actions.tipCompensation
  },
  labelY: function () {
    return DocTreeConfig.nodes.yMargin / 2
  },
  labelBackY: function () {
    return DocTreeConfig.nodes.yMargin / 2 - DocTreeConfig.nodes.titleHeight
  }
});

/**
 * Template Event Handlers
 */
Template.ActionSnippet.events({});

/**
 * Template Created
 */
Template.ActionSnippet.created = function () {
  
};

/**
 * Template Rendered
 */
Template.ActionSnippet.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.ActionSnippet.destroyed = function () {
  
};
