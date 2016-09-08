import './adventure_hover_controls.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureCommands } from '../../../api/adventure/adventure_command.js';
import { AdventureStatus } from '../../../api/adventure/adventure_status.js';
import { Util } from '../../../api/util.js';

/**
 * Template Helpers
 */
Template.AdventureHoverControls.helpers({});

/**
 * Template Helpers
 */
Template.AdventureHoverControls.events({
  "click .btn-left-click, click .btn-right-click" (e, instance) {
    var element = instance.data.controlledElement,
        command = $(e.target).closest(".btn").attr("data-command"),
        selector;
    
    // make sure the adventure is operating
    if (instance.data.adventure.status == AdventureStatus.complete) {
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
      AdventureCommands.insert({
        projectId  : instance.data.adventure.projectId,
        adventureId: instance.data.adventure._id,
        code       : "driver." + command + "(\"" + selector + "\");"
      }, (error) => {
        if (error) {
          RobaDialog.error("Error adding adventure command: " + error.message);
        }
      });
    } else {
      console.error("Hover Controls click, no selector found");
      console.log("element: ", element);
    }
  },
  "click .btn-hover" (e, instance) {
    var element = instance.data.controlledElement,
        selector;
    
    // make sure the adventure is operating
    if (instance.data.adventure.status == AdventureStatus.complete) {
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
      AdventureCommands.insert({
        projectId  : instance.data.adventure.projectId,
        adventureId: instance.data.adventure._id,
        code       : "var el = driver.element(\"" + selector + "\"); driver.moveTo(el.ELEMENT);"
      }, (error) => {
        if (error) {
          RobaDialog.error("Error adding adventure command: " + error.message);
        }
      });
    } else {
      console.error("Hover Controls hover, no selector found");
      console.log("element: ", element);
    }
  },
  "click .btn-type" (e, instance) {
    instance.$(".hidden-editable").editable("show");
  }
});

/**
 * Template Rendered
 */
Template.AdventureHoverControls.onRendered(() => {
  let instance = Template.instance();
  instance.$(".hidden-editable").editable({
    mode     : "popup",
    value    : "",
    emptyText: "",
    highlight: false,
    display () {
    },
    success (response, newValue) {
      var element = instance.data.controlledElement,
          selector;
      
      if (element.selectors && element.selectors.length) {
        selector = Util.escapeDoubleQuotes(element.selectors[ 0 ].selector);
      } else {
        selector = Util.getHighlightedElementSelector(element);
      }
      
      if (selector) {
        AdventureCommands.insert({
          projectId  : instance.data.adventure.projectId,
          adventureId: instance.data.adventure._id,
          code       : "driver.setValue(\"" + selector + "\", \"" + newValue + "\");"
        }, (error) => {
          instance.$(".hidden-editable").editable("setValue", "");
          if (error) {
            RobaDialog.error("Error adding adventure command: " + error.message);
          }
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
