import './adventure_highlight_detail.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Util } from '../../../../../imports/api/util.js';
import './adventure_highlight_detail_item.js';

/**
 * Template helpers
 */
Template.AdventureHighlightDetail.helpers({
  /**
   * Get the processed list of parent elements for this element
   */
  getHierarchy () {
    let el            = this,
        context       = Template.parentData(2),
        state         = context.state.get(),
        adventure     = context.adventure.get(),
        currentNodeId = context.currentNodeId.get(),
        scroll        = state.scroll,
        ratio         = (context.viewport.get().width / state.viewportSize.width);
    
    if (el.parent) {
      let elements = Util.getHighlightHierarchy(el);
      elements.push(_.omit(el, "parent"));
      _.each(elements, function (e, i) {
        e.index         = i;
        e.localBounds   = {
          top   : parseInt((e.bounds.top - scroll.y + e.bounds.scrollY) * ratio),
          left  : parseInt((e.bounds.left - scroll.x + e.bounds.scrollX) * ratio),
          height: parseInt(e.bounds.height * ratio),
          width : parseInt(e.bounds.width * ratio)
        };
        e.currentNodeId = currentNodeId;
        e.adventure     = adventure;
      });
      return elements;
    }
  },
  /**
   * Get the adjusted top position for this element
   * @returns {number}
   */
  getDetailTop () {
    if (this.bounds && this.localViewport) {
      let maskLayer  = this.localViewport.offset,
          adjustment = this.localViewport.parentOffset;
      
      return maskLayer.top + this.localBounds.top + this.localBounds.height - adjustment.top + 5;
    }
  },
  /**
   * Get the adjusted left position for this element
   * @returns {number}
   */
  getDetailLeft () {
    if (this.bounds && this.localViewport) {
      let maskLayer  = this.localViewport.offset,
          adjustment = this.localViewport.parentOffset,
          midPoint   = this.localViewport.width * 0.5;
      
      if (this.localBounds.left > midPoint) {
        return midPoint + maskLayer.left - adjustment.left;
      }
      
      return this.localBounds.left + maskLayer.left - adjustment.left;
    }
  },
  /**
   * Get the maximum width
   */
  getMaxWidth () {
    return this.localViewport.width;
    if (this.localBounds && this.localViewport) {
      let maskLayer  = this.localViewport.offset,
          adjustment = this.localViewport.parentOffset,
          midPoint   = this.localViewport.width * 0.5,
          left       = this.localBounds.left + maskLayer.left - adjustment.left;
      
      if (this.localBounds.left > midPoint) {
        left = midPoint + maskLayer.left - adjustment.left;
      }
      
      return this.localViewport.width - left;
    }
  }
});
