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
        hoverContainer = $(".hover-controls-container");
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete || element.placeholder) {
      return;
    }
    
    clearTimeout(element.context.hideHoverControlsTimeout);
    
    if (element.localBounds && hoverContainer) {
      hoverContainer
          .css("top", element.localBounds.top - 40)
          .css("left", element.localBounds.left)
          .css("display", "block");
  
      element.context.controlledElement.set(element);
    }
  },
  
  /**
   * Show the details on click
   * @param e
   * @param instance
   */
  "click .adventure-highlight-element" (e, instance) {
    var element = this,
        clickElement = $(e.target),
        highlightElement = clickElement.closest(".adventure-highlight-element"),
        detail  = $("#adventure-highlight-detail-" + element.index);
    
    if (!detail.length || element.placeholder) {
      return;
    }
    
    // make sure the hover controls are visible
    highlightElement.mouseenter();
    
    if (clickElement.hasClass("active")) {
      clickElement.removeClass("active");
      detail.removeClass("active");
    } else {
      // clear the currently active
      $(".adventure-highlight-element.active").removeClass("active");
      $(".adventure-highlight-detail.active").removeClass("active");
      clickElement.addClass("active");
      detail.addClass("active");
    }
  }
});
