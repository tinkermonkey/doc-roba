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
  getXPath () {
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
      if (error) {
        console.error("Error testing selector: " + error.message);
      } else if (command.result.highlightElements) {
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
  let instance = Template.instance();
  
  instance.autorun(() => {
    let input    = instance.$("input.selector-value"),
        elements = instance.data.selectorElements.get(),
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
