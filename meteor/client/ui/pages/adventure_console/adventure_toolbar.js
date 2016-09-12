import './adventure_toolbar.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureCommands } from '../../../../imports/api/adventure/adventure_command.js';
import { AdventureStatus } from '../../../../imports/api/adventure/adventure_status.js';
import { Nodes } from '../../../../imports/api/node/node.js';
import { Util } from '../../../../imports/api/util.js';
import './hover_controls/adventure_selector_action_menu.js';

/**
 * Template Helpers
 */
Template.AdventureToolbar.helpers({
  getXPath () {
    if (this.selectorElements) {
      var elements = this.selectorElements.get(),
          xPath    = "",
          element, previousElement;
      _.each(_.keys(elements), function (key) {
        element = elements[ key ];
        
        // start the xPath
        if (previousElement && previousElement.index == element.index - 1) {
          xPath += "/"
        } else {
          xPath += "//"
        }
        
        // set the tag selector
        if (element.tag) {
          xPath += element.tag
        } else {
          xPath += "*"
        }
        
        // set the attributes
        if (element.attributes.length) {
          xPath += "[";
          _.each(element.attributes, function (attribute, i) {
            if (i > 0) {
              xPath += " and ";
            }
            
            if (attribute.attribute == "class") {
              xPath += "contains(@" + attribute.attribute + ",\"" + attribute.value + "\")";
            } else {
              xPath += "@" + attribute.attribute + "=\"" + attribute.value + "\"";
            }
          });
          xPath += "]";
        }
        
        // store the previous
        previousElement = element;
      });
      
      return xPath;
    }
  },
  getCurrentNode () {
    var nodeId = this.currentNodeId.get();
    if (nodeId) {
      return Nodes.findOne({ staticId: nodeId, projectVersionId: this.adventure.get().projectVersionId });
    }
  },
  getSelector () {
    return { selector: Template.instance().selector.get() };
  }
});

/**
 * Template Helpers
 */
Template.AdventureToolbar.events({
  "click .btn-clear" (e, instance) {
    this.selectorElements.set({});
    this.checkResult.set();
    $(".adventure-highlight-detail").find(".selected").removeClass("selected");
    instance.$(".selector-value").val("");
  },
  "click .btn-refine" (e, instance) {
    var selector     = instance.$(".selector-value").val(),
        lastLocation = this.lastClickLocation.get(),
        adventure    = instance.data.adventure.get();
    
    console.log("Last click location: ", lastLocation);
    
    if (selector && lastLocation) {
      // send the command to clear all of the highlighted elements
      adventure.assistant()
          .refineSelector(adventure, lastLocation.x, lastLocation.y, selector, (error, command) => {
            if (error) {
              console.error("Error refining selector: " + error.message);
            } else {
              instance.data.checkResult.set(command.result)
            }
          });
    }
  },
  "click .btn-highlight" (e, instance) {
    let selector  = instance.$(".selector-value").val(),
        adventure = instance.data.adventure.get();
    
    // make sure the adventure is operating
    if (instance.data.adventure.get().status == AdventureStatus.complete) {
      return;
    }
    
    // send the command to clear all of the highlighted elements
    adventure.assistant().testSelector(adventure, selector, (error, command) => {
      if(error){
        console.error("Error testing selector: " + error.message);
      } else if(command.result.highlightElements){
        instance.data.highlightElements.set(command.result.highlightElements);
      }
    });
  },
  "keyup input.selector-value, change input.selector-value" (e, instance) {
    var selector     = instance.$(".selector-value").val(),
        lastLocation = this.lastClickLocation.get();
    console.log("Selector: ", selector);
    
    if (selector.length && lastLocation) {
      instance.$(".btn-clear").removeAttr("disabled");
      instance.$(".btn-refine").removeAttr("disabled");
      instance.$(".btn-highlight").removeAttr("disabled");
      instance.$(".btn-selector-dropdown").removeAttr("disabled");
    } else if (selector.length) {
      instance.$(".btn-clear").removeAttr("disabled");
      instance.$(".btn-refine").attr("disabled", "disabled");
      instance.$(".btn-highlight").removeAttr("disabled");
      instance.$(".btn-selector-dropdown").removeAttr("disabled");
    } else {
      instance.$(".btn-clear").attr("disabled", "disabled");
      instance.$(".btn-refine").attr("disabled", "disabled");
      instance.$(".btn-highlight").attr("disabled", "disabled");
      instance.$(".btn-selector-dropdown").attr("disabled", "disabled");
    }
    instance.selector.set(selector);
  },
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
    adventure.assistant().executeCommand(adventure, "true", (error, command) => {
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
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    // clear the last click location and check result
    instance.data.highlightElements.set([]);
    instance.data.lastClickLocation.set();
    instance.data.checkResult.set();
    
    // send the command to clear all of the highlighted elements
    /*
    adventure.assistant().executeCommand(adventure, "driver.clearHighlight();", (error, command) => {
      if (error) {
        RobaDialog.error("Error adding adventure command: " + error.message);
      }
    });
    */
  }
});

/**
 * Template Rendered
 */
Template.AdventureToolbar.onCreated(() => {
  let instance      = Template.instance();
  instance.selector = new ReactiveVar("");
});

/**
 * Template Rendered
 */
Template.AdventureToolbar.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdventureToolbar.onDestroyed(() => {
  
});
