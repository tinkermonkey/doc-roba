import './current_location_menu.html';
import { Template } from 'meteor/templating';
import '../adventure_status_bar.js';

/**
 * Template Helpers
 */
Template.CurrentLocationMenu.helpers({});

/**
 * Template Event Handlers
 */
Template.CurrentLocationMenu.events({
  "click .btn-show-current-node"(e, instance){
    let context = this;
    context.showCurrentLocation(true);
  },
  "click .btn-show-current-node-actions"(e, instance){
    let context = this;
    context.showCurrentLocationActions(true);
  }
});

/**
 * Template Created
 */
Template.CurrentLocationMenu.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.CurrentLocationMenu.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CurrentLocationMenu.onDestroyed(() => {
  
});
