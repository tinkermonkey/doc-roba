import './adventure_status_bar.html';

import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.AdventureStatusBar.helpers({
  adventureStatus(){
    return this.adventure.get().status
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureStatusBar.events({});

/**
 * Template Created
 */
Template.AdventureStatusBar.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdventureStatusBar.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdventureStatusBar.onDestroyed(() => {
  
});
