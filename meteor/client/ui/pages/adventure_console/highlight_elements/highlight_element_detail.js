import './highlight_element_detail.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { HighlightElementContext } from './highlight_element_context.js';
import './highlight_element_detail_row.js';
import '../adventure_toolbar.js';

/**
 * Template helpers
 */
Template.HighlightElementDetail.helpers({
  detailContext(){
    return Template.instance().detailContext;
  }
});

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
        clickedElement   = $(e.target),
        selectedElements = instance.detailContext.selectedElements.get();
    
    console.log("HighlightElementDetail.click selected: ", highlightElement.index, clickedElement);
    
    // Select or deselect
    clickedElement.toggleClass("selected");
    
    // Do the rollup for this row
    var element = {
      index     : highlightElement.index,
      attributes: []
    };
    clickedElement.closest(".adventure-highlight-level").find(".selected").each((i, detailEl) => {
      //console.log("Element", element.index, "selected item:", detailEl);
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
          RobaDialog.error("clickable failure: could not identify attribute or tag: " + clickedElement.text());
        }
      }
    });
    
    // update the selector elements
    var index = ("0000" + parseInt(element.index)).slice(-4);
    if (element.tag || element.attributes.length) {
      // set the element
      selectedElements[ "_" + index ] = element;
    } else {
      // make sure the element is nulled
      delete selectedElements[ "_" + index ];
    }
    
    // sort by index
    var sortedElements = {};
    _.each(_.sortBy(_.keys(selectedElements), (key) => {
      return selectedElements[ key ].index
    }), (key) => {
      sortedElements[ key ] = selectedElements[ key ];
    });
    
    // done
    console.log("updating elements: ", sortedElements);
    instance.detailContext.selectedElements.set(sortedElements);
  }
});

/**
 * Template created
 */
Template.HighlightElementDetail.onCreated(() => {
  let instance           = Template.instance();
  instance.detailContext = new HighlightElementContext(instance, instance.data.context);
});