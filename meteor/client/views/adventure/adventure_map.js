/**
 * AdventureMap
 *
 * Created by austinsand on 3/28/15
 *
 */

/**
 * Template Helpers
 */
Template.AdventureMap.helpers({
  isLoaded: function () {
    var instance = Template.instance();
    return instance.nodesLoaded.get() && instance.actionsLoaded.get();
  },
  getCurrentNode: function () {
    if(this.currentNode){
      return this.currentNode.get();
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
Template.AdventureMap.created = function () {
  var instance = this;

  // create a loading status variable
  instance.nodesLoaded = new ReactiveVar(false);
  instance.actionsLoaded = new ReactiveVar(false);

  // subscribe to all of the nodes for this project version
  instance.subscribe("nodes", [instance.data.adventure.projectId, instance.data.adventure.projectVersionId], function () {
    instance.nodesLoaded.set(true);
  });

  // subscribe to all of the actions for this project version
  instance.subscribe("actions", [instance.data.adventure.projectId, instance.data.adventure.projectVersionId], function () {
    instance.actionsLoaded.set(true);
  });
};

/**
 * Template Rendered
 */
Template.AdventureMap.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.AdventureMap.destroyed = function () {

};
