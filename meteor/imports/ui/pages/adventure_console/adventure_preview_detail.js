/**
 * Template helpers
 */
Template.AdventurePreviewDetail.helpers({
  /**
   * Get the processed list of parent elements for this element
   */
  getHierarchy: function () {
    var el = this,
      parent = Template.parentData(3),
      scroll = parent.state.scroll,
      ratio  = (parent.viewport.width / parent.state.viewportSize.width);

    if(el.parent){
      var elements = getHierarchy(el);
      elements.push(_.omit(el, "parent"));
      _.each(elements, function (e, i) {
        e.index = i;
        e.localBounds = {
          top: parseInt( (e.bounds.top - scroll.y + e.bounds.scrollY) * ratio ),
          left: parseInt( (e.bounds.left - scroll.x + e.bounds.scrollX) * ratio ),
          height: parseInt( e.bounds.height * ratio ),
          width: parseInt( e.bounds.width * ratio )
        };
      });
      return elements;
    }
  },
  /**
   * Get the adjusted top position for this element
   * @returns {number}
   */
  getDetailTop: function () {
    if(this.bounds && this.localViewport){
      var maskLayer = this.localViewport.offset,
        adjustment = this.localViewport.parentOffset;

      return maskLayer.top + this.localBounds.top + this.localBounds.height - adjustment.top + 5;
    }
  },
  /**
   * Get the adjusted left position for this element
   * @returns {number}
   */
  getDetailLeft: function () {
    if(this.bounds && this.localViewport){
      var maskLayer = this.localViewport.offset,
        adjustment = this.localViewport.parentOffset,
        midPoint = this.localViewport.width * 0.5;

      if(this.localBounds.left > midPoint){
        return midPoint + maskLayer.left - adjustment.left;
      }

      return this.localBounds.left + maskLayer.left - adjustment.left;
    }
  },
  /**
   * Get the maximum width
   */
  getMaxWidth: function () {
    if(this.localBounds && this.localViewport){
      var maskLayer = this.localViewport.offset,
        adjustment = this.localViewport.parentOffset,
        midPoint = this.localViewport.width * 0.5,
        left = this.localBounds.left + maskLayer.left - adjustment.left;

      if(this.localBounds.left > midPoint){
        left = midPoint + maskLayer.left - adjustment.left;
      }

      return this.localViewport.width - left;
    }
  }
});

/**
 * Convert the hierarchical parent structure into a list
 * Base element first
 * @param el
 */
var getHierarchy = function (el) {
  var parents = [];
  if(el.parent){
    var ancestors = getHierarchy(el.parent);
    _.each(ancestors, function (a) {
      parents.push(a);
    });

    parents.push(_.omit(el.parent, "parent"));
  }
  return parents;
};