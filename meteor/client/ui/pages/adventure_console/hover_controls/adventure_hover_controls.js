import './adventure_hover_controls.html';
import './adventure_hover_controls.css';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureStatus } from '../../../../../imports/api/adventures/adventure_status.js';
import { Util } from '../../../../../imports/api/util.js';

/**
 * Template Helpers
 */
Template.AdventureHoverControls.helpers({});

/**
 * Template Helpers
 */
Template.AdventureHoverControls.events({
  /**
   * Hide the hover controls
   */
  "mouseleave .hover-controls-container" (e, instance) {
    let context = this;
    context.considerHidingHoverControls();
  },
  
  /**
   * Prevent the hover controls from hiding during the timeout
   */
  "mouseenter .hover-controls-container" (e, instance) {
    let context = this;
    clearTimeout(context.hideHoverControlsTimeout);
  },
  
  /**
   * Handle a click for one of the buttons
   * @param e
   * @param instance
   */
  "click .btn-left-click, click .btn-right-click" (e, instance) {
    var context = this,
        adventure = context.adventure.get(),
        element   = context.controlledElement.get(),
        command   = $(e.target).closest(".btn").attr("data-command"),
        selector;
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    // use a validated selector if one exists
    if (element.selectors && element.selectors.length) {
      selector = Util.escapeDoubleQuotes(element.selectors[ 0 ].selector);
    } else {
      selector = Util.getHighlightedElementSelector(element);
    }
    
    // send the command to clear all of the highlighted elements
    if (selector) {
      let code = "driver." + command + "(\"" + selector + "\");";
      adventure.assistant().executeCommand(adventure, code, (error, command) => {
        if (error) {
          console.error("Error adding adventure command: " + error.message);
        }
      });
    } else {
      console.error("Hover Controls click, no selector found");
      console.log("element: ", element);
    }
  },
  
  /**
   * Hover the remote pointer over an element
   * @param e
   * @param instance
   */
  "click .btn-hover" (e, instance) {
    var context = this,
        adventure = context.adventure.get(),
        element   = context.controlledElement.get(),
        selector;
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    // use a validated selector if one exists
    if (element.selectors && element.selectors.length) {
      selector = Util.escapeDoubleQuotes(element.selectors[ 0 ].selector);
    } else {
      selector = Util.getHighlightedElementSelector(element);
    }
    
    // send the command to clear all of the highlighted elements
    if (selector) {
      adventure.assistant().hoverElement(adventure, selector, (error, command) => {
        if (error) {
          console.error("Error adding adventure command: " + error.message);
        }
      });
    } else {
      console.error("Hover Controls hover, no selector found");
      console.log("element: ", element);
    }
  },
  "click .btn-type" (e, instance) {
    instance.$(".hover-controls-hidden-editable").editable("show");
  }
});

/**
 * Template Rendered
 */
Template.AdventureHoverControls.onRendered(() => {
  let instance = Template.instance();
  
  instance.$(".hover-controls-hidden-editable").editable({
    mode     : "popup",
    value    : "",
    emptyText: "",
    highlight: false,
    display () {
    },
    success (response, newValue) {
      var adventure = instance.data.adventure.get(),
          element   = instance.data.controlledElement.get(),
          selector;
      
      if (element.selectors && element.selectors.length) {
        selector = Util.escapeDoubleQuotes(element.selectors[ 0 ].selector);
      } else {
        selector = Util.getHighlightedElementSelector(element);
      }
      
      if (selector) {
        adventure.assistant().setValue(adventure, selector, newValue, (error, command) => {
          if (error) {
            console.error("Error adding adventure command: " + error.message);
          }
          instance.$(".hover-controls-hidden-editable").editable("setValue", "");
        });
      } else {
        console.error("Hover Controls type, no selector found");
        console.log("element: ", element);
      }
    }
  });
  
});

/**
 * Template Destroyed
 */
Template.AdventureHoverControls.onDestroyed(() => {
  
});
