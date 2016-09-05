/**
 * Template Helpers
 */
Template.AdventureRoute.helpers({
  getVariableValue: function () {
    return this.hasOwnProperty("value") ? this.value : this.defaultValue
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureRoute.events({});

/**
 * Template Created
 */
Template.AdventureRoute.created = function () {
  
};

/**
 * Template Rendered
 */
Template.AdventureRoute.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.AdventureRoute.destroyed = function () {
  
};
