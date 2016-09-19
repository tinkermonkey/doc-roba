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
    let locationContainer = $('.current-location'),
        actionsContainer  = $('.current-location-actions'),
        actionsIsVisible  = actionsContainer.css("display") != "none",
        isHidden          = locationContainer.css("display") == "none";
  
    if (isHidden && actionsIsVisible) {
      actionsContainer.slideUp(250, () => {
        locationContainer.slideDown(250);
      });
    }
    if (isHidden) {
      locationContainer.slideDown(250);
    } else {
      locationContainer.slideUp(250);
    }
  },
  "click .btn-show-current-node-actions"(e, instance){
    let locationContainer = $('.current-location'),
        actionsContainer  = $('.current-location-actions'),
        locationIsVisible = locationContainer.css("display") != "none",
        isHidden          = actionsContainer.css("display") == "none";
  
    if (isHidden && locationIsVisible) {
      locationContainer.slideUp(250, () => {
        actionsContainer.slideDown(250);
      });
    }
    if (isHidden) {
      actionsContainer.slideDown(250);
    } else {
      actionsContainer.slideUp(250);
    }
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
