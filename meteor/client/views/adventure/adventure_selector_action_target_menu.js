/**
 * Template Helpers
 */
Template.AdventureSelectorActionTargetMenu.helpers({
  getActions: function () {
    return Actions.find({nodeId: this.staticId, projectVersionId: this.projectVersionId}, {sort: {title: 1}});
  },
  getNavMenus: function () {
    if(this.navMenus){
      return Nodes.find({nodeId: {$in: this.navMenus }, projectVersionId: this.projectVersionId}, {sort: {title: 1}});
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
