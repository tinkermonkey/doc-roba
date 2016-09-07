import "./adventure_route.html";
import "./route.css";
import { Template } from "meteor/templating";

/**
 * Template Helpers
 */
Template.AdventureRoute.helpers({
  getVariableValue () {
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
