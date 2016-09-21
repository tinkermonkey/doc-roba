import './adventure_toolbar.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureStatus } from '../../../../imports/api/adventure/adventure_status.js';
import { Nodes } from '../../../../imports/api/node/node.js';
import './hover_controls/adventure_selector_action_menu.js';

/**
 * Template Helpers
 */
Template.AdventureToolbar.helpers({
});

/**
 * Template Helpers
 */
Template.AdventureToolbar.events({
  "click .btn-clear" (e, instance) {
    let detailContext = this;
    
    // Clear out the reactive vars
    detailContext.selectedElements.set({});
    detailContext.checkResult.set();
    
    // De-select any of the selected elements
    $(e.target).closest(".adventure-highlight-detail").find(".selected").removeClass("selected");
    
    // Clear out the selector input
    instance.$(".selector-value").val("");
  },
  "click .btn-refine" (e, instance) {
    var detailContext = this,
        selectorText  = instance.$(".selector-value").val(),
        lastLocation  = detailContext.adventureContext.lastClickLocation.get(),
        adventure     = detailContext.adventureContext.adventure.get();
    
    console.log("Last click location: ", lastLocation);
    
    if (selectorText && lastLocation) {
      // send the command to clear all of the highlighted elements
      adventure.assistant()
          .refineSelector(adventure, lastLocation.x, lastLocation.y, selectorText, (error, command) => {
            if (error) {
              console.error("Error refining selector: " + error.message);
            } else {
              detailContext.checkResult.set(command.result)
            }
          });
    }
  },
  
  /**
   * Highlight elements that match the current selector
   * @param e
   * @param instance
   */
  "click .btn-highlight" (e, instance) {
    let detailContext = this,
        selector      = instance.$(".selector-value").val(),
        adventure     = detailContext.adventureContext.adventure.get();
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    // send the command to clear all of the highlighted elements
    adventure.assistant().testSelector(adventure, selector, (error, command) => {
      if (error) {
        console.error("Error testing selector: " + error.message);
      } else if (command.result.highlightElements) {
        detailContext.adventureContext.highlightElements.set(command.result.highlightElements);
      }
    });
  },
  //"keyup input.selector-value, change input.selector-value" (e, instance) {
  
  /**
   * React to changes in input value
   * @param e
   * @param instance
   */
  "change input.selector-value" (e, instance) {
    var detailContext = this,
        selectorText  = instance.$(".selector-value").val(),
        lastLocation  = detailContext.adventureContext.lastClickLocation.get();
    
    if (selectorText.length && lastLocation) {
      instance.$(".btn-clear").removeAttr("disabled");
      instance.$(".btn-refine").removeAttr("disabled");
      instance.$(".btn-highlight").removeAttr("disabled");
      instance.$(".btn-selector-dropdown").removeAttr("disabled");
    } else if (selectorText.length) {
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
    
    detailContext.inputText.set(selectorText);
    console.log("AdventureToolbar.change selectorText:", selectorText);
  }
});

/**
 * Template Rendered
 */
Template.AdventureToolbar.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdventureToolbar.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let input    = instance.$("input.selector-value"),
        elements = instance.data.selectedElements.get(),
        xPath    = "",
        element, previousElement;
    
    _.each(_.keys(elements), function (key) {
      console.log("getXPath processing element:", key, elements[ key ]);
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
        _.each(element.attributes, (att, i) => {
          if (i > 0) {
            xPath += " and ";
          }
          
          if (att.attribute == "class") {
            xPath += "contains(@" + att.attribute + ",\"" + att.value + "\")";
          } else if (att.attribute == "text" && att.value.length) {
            xPath += att.value.split(" ").map((segment) => {
              return "text()[contains(.,\"" + segment + "\")]"
            }).join(" and ");
          } else {
            xPath += "@" + att.attribute + "=\"" + att.value + "\"";
          }
        });
        xPath += "]";
      }
      
      // store the previous
      previousElement = element;
    });
    
    // trigger a change event on the input field because this doesn't happen automatically
    //instance.$("input.selector-value").trigger("change");
    input.val(xPath);
    input.trigger("change");
  })
});

/**
 * Template Destroyed
 */
Template.AdventureToolbar.onDestroyed(() => {
  
});
