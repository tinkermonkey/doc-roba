import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { ReactiveVar } from 'meteor/reactive-var';
import '../../roba_ace/roba_ace.js';

/**
 Code editor input
 
 @class editableAce
 @extends abstractinput
 @final
 **/
(function ($) {
  "use strict";
  
  var EditableAce = function (options) {
    this.init("editableAce", options, EditableAce.defaults);
    this.reactiveData = new ReactiveVar({});
  };
  
  $.fn.editableutils.inherit(EditableAce, $.fn.editabletypes.abstractinput);
  
  $.extend(EditableAce.prototype, {
    /**
     * Render the editor control
     */
    render() {
      let self         = this,
          data         = self.data || self.options.parentInstance.data,
          currentValue = self.reactiveData.get();
      
      //console.log("EditableAce render data:", data, "options:", self.options);
      
      currentValue.minWidth  = Math.max(self.options.parentInstance.$(".editable").width(), self.options.minWidth);
      currentValue.minHeight = self.options.minHeight;
      currentValue.minLines  = self.options.minLines;
      currentValue.maxLines  = self.options.maxLines;
      currentValue.mode      = self.options.language;
      self.reactiveData.set(currentValue);
      
      Blaze.renderWithData(Template.RobaAce, function () {
        //let value = self.reactiveData.get();
        //console.log('EditableAce reactiveData value:', value);
        return self.reactiveData.get();
      }, self.$input.get(0));
      
      if (self.options.parentInstance) {
        self.options.parentInstance.formView = Blaze.getView(self.$input.find(".roba-ace").get(0));
      }
    },
    
    /**
     Sets value of input.
     
     @method value2input(value)
     @param {mixed} data
     **/
    value2input(data) {
      //console.log("xEditableAce.value2input:", data, this.options.parentInstance.$(".editable").width());
      let currentValue = this.reactiveData.get();
      if (data && data.value && data.value != currentValue.value) {
        currentValue.value = data.value;
        this.reactiveData.set(currentValue);
      }
    },
    
    /**
     Returns value of input.
     
     @method input2value()
     **/
    input2value() {
      //console.log("xEditableAce.input2value");
      return Blaze.getView(this.$input.find(".roba-ace").get(0)).templateInstance().editor.getValue();
    }
  });
  
  EditableAce.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    /**
     @property tpl
     **/
    tpl: '<div class="x-editable-ace"></div>',
    
    /**
     @property parentInstance
     @type object
     @default null
     **/
    parentInstance: null,
    data          : null,
    language      : 'javascript',
    minLines      : 10,
    maxLines      : null,
    minWidth      : 710,
    minHeight     : 200
  });
  
  $.fn.editabletypes.editableAce = EditableAce;
  
}(window.jQuery));