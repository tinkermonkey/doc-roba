import {Template} from 'meteor/templating';
import {Blaze} from 'meteor/blaze';

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
  };

  $.fn.editableutils.inherit(EditableAce, $.fn.editabletypes.abstractinput);

  $.extend(EditableAce.prototype, {
    /**
     * Render the editor control
     */
    render() {
      var self  = this,
          data  = self.data || this.options.parentInstance.data,
          width = self.options.parentInstance.$(".editable").width() - 110;

      Blaze.renderWithData(Template.RobaAce, {
        value: data.value,
        width: width,
        minLines: data.minLines,
        maxLines: data.maxLines,
        mode: data.language
      }, this.$input.get(0));

      if(this.options.parentInstance){
        this.options.parentInstance.formView = Blaze.getView(this.$input.find(".roba-ace").get(0));
      }
    },

    /**
     Sets value of input.

     @method value2input(value)
     @param {mixed} data
     **/
    value2input(data) {
      // this is handled by the editor template
      var editor = Blaze.getView(this.$input.find(".roba-ace").get(0)).templateInstance().editor;
      if(editor && data && data.value){
        //console.log("xEditableAce.value2input:", data.value);
        editor.setValue(data.value);
        this.data = data;
      }
    },

    /**
     Returns value of input.

     @method input2value()
     **/
    input2value() {
      return Blaze.getView(this.$input.find(".roba-ace").get(0)).templateInstance().editor.getValue();
    }
  });

  EditableAce.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    /**
     @property tpl
     **/
    tpl:  '<div class="x-editable-ace"></div>',

    /**
     @property parentInstance
     @type object
     @default null
     **/
    parentInstance: null
  });

  $.fn.editabletypes.editableAce = EditableAce;

}(window.jQuery));