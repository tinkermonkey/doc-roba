import './highlight_element.html';
import './highlight_element.css';
import { Template } from 'meteor/templating';
import { AdventureStatus } from '../../../../../imports/api/adventure/adventure_status.js';

/**
 * Template helpers
 */
Template.HighlightElement.helpers({});

/**
 * Event Handlers
 */
Template.HighlightElement.events({
  /**
   * Show the hover controls for a highlight element
   */
  "mouseenter .adventure-highlight-element" (e, instance) {
    let element        = this,
        adventure      = element.context.adventure.get(),
        hoverContainer = instance.$(".hover-controls-container");
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    clearTimeout(instance.hideHoverControlsTimeout);
    
    //console.log("mouseenter: ", element);
    if (element.localBounds && hoverContainer) {
      hoverContainer
          .css("top", element.localBounds.top - 40)
          .css("left", element.localBounds.left)
          .css("display", "block");
      
      instance.data.context.controlledElement.set(element);
    }
  },
  
  /**
   * Show the details on click
   * @param e
   * @param instance
   */
  "click .adventure-highlight-element" (e, instance) {
    var element  = $(e.target),
        detail   = $("#adventure-highlight-detail-" + instance.data.index);
    
    if(!detail.length){
      console.error("HighlightElement.click failed to find detail item:", instance.data, e.target);
    }
    
    if (element.hasClass("active")) {
      element.removeClass("active");
      detail.removeClass("active");
    } else {
      // clear the currently active
      $(".adventure-highlight-element.active").removeClass("active");
      $(".adventure-highlight-detail.active").removeClass("active");
      element.addClass("active");
      detail.addClass("active");
    }
  }
});
