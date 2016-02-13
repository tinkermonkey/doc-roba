/**
 * Template Helpers
 */
Template.AdventureSelectorResult.helpers({
  fullContext: function () {
    var instance = Template.instance(),
        selector = this,
        currentNodeId = instance.data.currentNodeId,
        adventure = instance.data.adventure;

    if(currentNodeId && adventure){
      return {
        selector: selector,
        node: Collections.Nodes.findOne({ staticId: currentNodeId, projectVersionId: adventure.projectVersionId }),
        adventure: adventure
      };
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
