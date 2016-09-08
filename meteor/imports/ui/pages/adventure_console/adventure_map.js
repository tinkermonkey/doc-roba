/**
 * Template Helpers
 */
Template.AdventureMap.helpers({
  getCurrentNode () {
    if(this.currentNodeId){
      return this.currentNodeId.get();
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureMap.events({});

/**
 * Template Created
 */
Template.AdventureMap.onCreated( () =>  {
  var instance = this;

  instance.autorun(function () {
    var data = Template.currentData();
    instance.subscribe("nodes", data.adventure.projectId, data.adventure.projectVersionId);
    instance.subscribe("actions", data.adventure.projectId, data.adventure.projectVersionId);
  });
};

/**
 * Template Rendered
 */
Template.AdventureMap.onRendered( () =>  {

};

/**
 * Template Destroyed
 */
Template.AdventureMap.onDestroyed( () =>  {

};
