import './remote_screen_scroller.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureStatus } from '../../../../imports/api/adventures/adventure_status.js';

/**
 * Template Helpers
 */
Template.RemoteScreenScroller.helpers({});

/**
 * Template Event Handlers
 */
Template.RemoteScreenScroller.events({
  /**
   * Click event for the scroll buttons
   * @param e
   */
  "click .btn-scroll" (e, instance) {
    let adventure = instance.data.adventure.get(),
        direction = $(e.target).closest('.btn').attr('data-direction'),
        state     = instance.data.state.get(),
        step      = 100,
        scroll    = {
          left: state.scroll.x || 0,
          top : state.scroll.y || 0
        };
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    // Make the adjustment
    switch (direction) {
      case "left":
        scroll.left = Math.max(scroll.left - step, 0);
        break;
      case "right":
        scroll.left = Math.max(Math.min(scroll.left + step, state.size.width - state.viewportSize.width), 0);
        break;
      case "up":
        scroll.top = Math.max(scroll.top - step, 0);
        break;
      case "down":
        scroll.top = Math.max(Math.min(scroll.top + step, state.size.height - state.viewportSize.height), 0);
        break;
    }
    
    // send the command to clear all of the highlighted elements
    console.log("RemoteScreenScroller btn-scroll click:", direction, scroll, state.scroll, state.size, state.viewportSize);
    adventure.assistant().scrollScreen(adventure, scroll.left, scroll.top, (error, command) => {
      if (error) {
        RobaDialog.error("Error adding adventure command: " + error.message);
      }
    });
  },
  
});

/**
 * Template Created
 */
Template.RemoteScreenScroller.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.RemoteScreenScroller.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.RemoteScreenScroller.onDestroyed(() => {
  
});
