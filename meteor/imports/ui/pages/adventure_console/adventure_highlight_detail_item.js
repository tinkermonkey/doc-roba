import './adventure_highlight_detail_item.html';
import { Template } from 'meteor/templating';
import './adventure_selector_result.js';

/**
 * Template Helpers
 */
Template.AdventureHighlightDetailItem.helpers({
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
Template.AdventureHighlightDetailItem.events({
  "click .adventure-highlight-hierarchy .toggle" (e) {
    var content    = $(e.target).closest(".adventure-highlight-hierarchy").next(".adventure-highlight-hierarchy-content"),
        toggleIcon = $(e.target).closest(".toggle").find(".glyphicon");
    
    content.toggleClass("active");
    toggleIcon.toggleClass("glyphicon-chevron-down");
    toggleIcon.toggleClass("glyphicon-chevron-up");
  }
});