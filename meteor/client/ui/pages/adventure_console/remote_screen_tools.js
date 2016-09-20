import './remote_screen_tools.html';
import { Template } from 'meteor/templating';
import { AdventureStatus } from '../../../../imports/api/adventure/adventure_status.js';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';

/**
 * Template Helpers
 */
Template.RemoteScreenTools.helpers({});

/**
 * Template Event Handlers
 */
Template.RemoteScreenTools.events({
  /**
   * Click event for the refresh button
   * @param e
   */
  "click .btn-refresh" (e, instance) {
    let adventure = instance.data.adventure.get();
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    // send the command to clear all of the highlighted elements
    adventure.assistant().refreshScreen(adventure, (error, command) => {
      if (error) {
        RobaDialog.error("Error adding adventure command: " + error.message);
      }
    });
  },
  /**
   * Click event for the clear-highlight button
   * @param e
   */
  "click .btn-clear-highlight" (e, instance) {
    let adventure = instance.data.adventure.get();
    
    // clear the last click location and check result
    instance.data.highlightElements.set([]);
    instance.data.lastClickLocation.set();
    instance.data.checkResult.set();
    
    // Hide any orphaned highlights
    instance.$(".adventure-hover-element-highlight").css("visibility", "hidden");
  },
  
});

/**
 * Template Created
 */
Template.RemoteScreenTools.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.RemoteScreenTools.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.RemoteScreenTools.onDestroyed(() => {
  
});
