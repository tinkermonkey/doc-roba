import './highlight_element.html';
import { Template } from 'meteor/templating';

/**
 * Template helpers
 */
Template.HighlightElement.helpers({});

/**
 * Event Handlers
 */
Template.HighlightElement.events({
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
