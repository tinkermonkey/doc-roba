/**
 * Template Helpers
 */
Template.AdventureSelectorResult.helpers({
  getCurrentNode: function () {
    var currentNode = Util.findParentData("currentNode"),
      adventure = Util.findParentData("adventure");
    if(currentNodeId && adventure){
      return Collections.Nodes.findOne({ staticId: currentNodeId.get(), projectVersionId: adventure.projectVersionId });
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureSelectorResult.events({});

/**
 * Template Created
 */
Template.AdventureSelectorResult.created = function () {
  
};

/**
 * Template Rendered
 */
Template.AdventureSelectorResult.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.AdventureSelectorResult.destroyed = function () {
  
};
