import './highlight_element_detail.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import './highlight_element_detail_row.js';

/**
 * Template helpers
 */
Template.HighlightElementDetail.helpers({});

/**
 * Template events
 */
Template.HighlightElementDetail.events({
  
  /**
   * Click one of the selectable xpath components
   * @param e
   * @param instance
   */
  "click .adventure-highlight-hierarchy .clickable, click .adventure-highlight-hierarchy-content .clickable" (e, instance) {
    var highlightElement = this,
        el               = $(e.target),
        selectorElements = instance.data.context.selectorElements.get();
    
    console.log("selected: ", highlightElement.index, el);
    
    el.toggleClass("selected");
    
    // Do the rollup for this row
    var element = {
      index     : highlightElement.index,
      attributes: []
    };
    el.closest(".adventure-highlight-level").find(".selected").each((i, detailEl) => {
      console.log("Element", element.index, "selected item:", detailEl);
      let detail = $(detailEl);
      
      if (detail.hasClass("tag")) {
        element.tag = detail.text().trim();
      } else {
        let attribute = detail.prevAll(".attr").first(),
            value     = detail.text().trim();
        
        if (attribute && attribute.text()) {
          element.attributes.push({
            attribute: attribute.text().trim(),
            value    : value
          });
        } else {
          RobaDialog.error("clickable failure: could not identify attribute or tag: " + el.text());
        }
      }
    });
    
    // update the selector elements
    var index = ("0000" + parseInt(element.index)).slice(-4);
    if (element.tag || element.attributes.length) {
      // set the element
      selectorElements[ "_" + index ] = element;
    } else {
      // make sure the element is nulled
      delete selectorElements[ "_" + index ];
    }
    
    // sort by index
    var sortedElements = {};
    _.each(_.sortBy(_.keys(selectorElements), (key) => {
      return selectorElements[ key ].index
    }), (key) => {
      sortedElements[ key ] = selectorElements[ key ];
    });
    
    // done
    console.log("updating elements: ", sortedElements);
    instance.data.context.selectorElements.set(sortedElements);
  }
});
