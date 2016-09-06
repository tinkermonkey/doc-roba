/**
 * Template Helpers
 */
Template.AdventureSelectorActionTargetMenu.helpers({
  getActions: function () {
    var node = (this.type && this.type == NodeTypes.navMenu) ? this : this.node;
    if(node){
      return Actions.find({nodeId: node.staticId, projectVersionId: node.projectVersionId}, {sort: {title: 1}});
    }
  },
  getNavMenus: function () {
    if(this.node && this.node.navMenus){
      return Nodes.find({staticId: {$in: this.node.navMenus }, projectVersionId: this.node.projectVersionId}, {sort: {title: 1}});
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
