import './highlight_element_detail_row.html';
import { Template } from 'meteor/templating';
import '../hover_controls/adventure_selector_result.js';

/**
 * Template Helpers
 */
Template.HighlightElementDetailRow.helpers({
  /**
   * Get the padding based on the hierarchy element padding
   * @returns {number}
   */
  getLeftPadding () {
    if (this.index) {
      return this.index * 10;
    } else {
      return 0;
    }
  },
  splitValues (item) {
    var valueList    = [],
        rawValueList = this.value.split(" ");
    _.each(rawValueList, (subValue, i) => {
      var context   = _.omit(item, "html", "text");
      context.value = subValue.trim();
      context.last  = i == rawValueList.length - 1;
      
      valueList.push(context);
    });
    return valueList;
  }
});

/**
 * Event Handlers
 */
Template.HighlightElementDetailRow.events({
  /**
   * Expand the details when the toggle is clicks
   * @param e
   */
  "click .adventure-highlight-hierarchy .toggle" (e) {
    var content    = $(e.target).closest(".adventure-highlight-hierarchy").next(".adventure-highlight-hierarchy-content"),
        toggleIcon = $(e.target).closest(".toggle").find(".glyphicon");
    
    content.toggleClass("active");
    toggleIcon.toggleClass("glyphicon-chevron-down");
    toggleIcon.toggleClass("glyphicon-chevron-up");
  },
  
  /**
   * Highlight the element bounding box when the row is hovered
   * @param e
   * @param instance
   */
  "mouseenter .adventure-highlight-hierarchy" (e, instance) {
    var localBounds   = this.localBounds,
        activeElement = instance.$(".adventure-highlight-detail.active .adventure-highlight-hierarchy:last")[ 0 ];
    
    if (activeElement && activeElement == e.target) {
      return;
    }
    
    // this needs to be delayed slightly to ensure any mouseleave triggers first
    if (localBounds) {
      setTimeout(function () {
        instance.$(".adventure-hover-element-highlight")
            .css("visibility", "visible")
            .css("top", localBounds.top + "px")
            .css("left", localBounds.left + "px")
            .css("width", localBounds.width + "px")
            .css("height", localBounds.height + "px");
      }, 10);
    } else {
      console.error("mouseenter adventure-highlight-hierarchy without bounds");
    }
  },
  
  /**
   * Remove the highlight when the mouse leaves the row
   * @param e
   * @param instance
   */
  "mouseleave .adventure-highlight-hierarchy" (e, instance) {
    instance.$(".adventure-hover-element-highlight")
        .css("top", "50%")
        .css("left", "50%")
        .css("width", "1px")
        .css("height", "1px")
        .css("visibility", "hidden");
  }
});