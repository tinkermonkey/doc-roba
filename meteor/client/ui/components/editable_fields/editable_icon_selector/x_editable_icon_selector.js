import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import './icon_list.js';

/**
 Icon selector input
 
 @class iconSelector
 @extends abstractinput
 @final
 **/
(function ($) {
  "use strict";
  
  var IconSelector = function (options) {
    this.init("iconSelector", options, IconSelector.defaults);
  };
  
  $.fn.editableutils.inherit(IconSelector, $.fn.editabletypes.abstractinput);
  
  $.extend(IconSelector.prototype, {
    render() {
      this.$input.parent().append('<div class="x-editable-icon-selector"></div>');
      this.search = this.$input.parent().find(".x-editable-icon-selector");
      
      Blaze.renderWithData(Template.IconList, {
        xEditable: this
      }, this.search.get(0));
      
      if (this.options.parentInstance) {
        this.options.parentInstance.searchView = Blaze.getView(this.search.children().get(0))
      }
    }
  });
  
  IconSelector.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    /**
     @property tpl
     @default <input type="text">
     **/
    tpl: '<input type="hidden" class="x-editable-icon-value">',
    
    /**
     @property parentInstance
     @type object
     @default null
     **/
    parentInstance: null
  });
  
  $.fn.editabletypes.iconSelector = IconSelector;
  
}(window.jQuery));