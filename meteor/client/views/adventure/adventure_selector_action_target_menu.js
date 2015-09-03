/**
 * Template Helpers
 */
Template.AdventureSelectorActionTargetMenu.helpers({
  getActions: function () {
    return Actions.find({nodeId: this.node.staticId, projectVersionId: this.node.projectVersionId}, {sort: {title: 1}});
  },
  getNavMenus: function () {
    if(this.node && this.node.navMenus){
      return Nodes.find({nodeId: {$in: this.node.navMenus }, projectVersionId: this.node.projectVersionId}, {sort: {title: 1}});
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureSelectorActionTargetMenu.events({});

/**
 * Template Created
 */
Template.AdventureSelectorActionTargetMenu.created = function () {
  
};

/**
 * Template Rendered
 */
Template.AdventureSelectorActionTargetMenu.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.AdventureSelectorActionTargetMenu.destroyed = function () {
  
};
