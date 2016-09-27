import './highlight_element_toolbar.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureStatus } from '../../../../../imports/api/adventure/adventure_status.js';
import '../hover_controls/adventure_selector_action_menu.js';

/**
 * Template Helpers
 */
Template.HighlightElementToolbar.helpers({});

/**
 * Template Helpers
 */
Template.HighlightElementToolbar.events({
  /**
   * Clear out the current selector
   * @param e
   * @param instance
   */
  "click .btn-clear" (e, instance) {
    let detailContext = this;
    
    // Clear out the reactive vars
    detailContext.selectedElements.set({});
    detailContext.checkResult.set();
    detailContext.selector.set();
    
    // De-select any of the selected elements
    $(e.target).closest(".adventure-highlight-detail").find(".selected").removeClass("selected");
  },
  
  /**
   * Test the current selector to see if it selects a single element
   * @param e
   * @param instance
   */
  "click .btn-refine" (e, instance) {
    var detailContext = this,
        selector      = detailContext.selector.get(),
        lastLocation  = detailContext.adventureContext.lastClickLocation.get(),
        adventure     = detailContext.adventureContext.adventure.get();
    
    console.log("Last click location: ", lastLocation);
    
    if (selector && lastLocation) {
      // send the command to clear all of the highlighted elements
      adventure.assistant()
          .refineSelector(adventure, lastLocation.x, lastLocation.y, selector, (error, command) => {
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
        selector      = detailContext.selector.get(),
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
  
  /**
   * Capture manual edits to the xpath
   * @param e
   * @param instance
   * @param newValue
   */
  "edited .editable"(e, instance, newValue){
    let detailContext = instance.data;
    detailContext.selector.set(newValue);
    $(e.target).closest(".adventure-highlight-detail").find(".selected").removeClass("selected");
  }
});

/**
 * Template Rendered
 */
Template.HighlightElementToolbar.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.HighlightElementToolbar.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let elements = instance.data.selectedElements.get(),
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
    
    // set the xPath
    instance.data.selector.set(xPath.length ? xPath : null);
  });
  
  instance.autorun(() => {
    let detailContext = Template.currentData(),
        selector      = detailContext.selector.get(),
        lastLocation  = detailContext.adventureContext.lastClickLocation.get();
    
    if (selector && selector.length && lastLocation) {
      instance.$(".btn-clear").removeAttr("disabled");
      instance.$(".btn-refine").removeAttr("disabled");
      instance.$(".btn-highlight").removeAttr("disabled");
      instance.$(".btn-selector-dropdown").removeAttr("disabled");
    } else if (selector && selector.length) {
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
    
  })
});

/**
 * Template Destroyed
 */
Template.HighlightElementToolbar.onDestroyed(() => {
  
});
