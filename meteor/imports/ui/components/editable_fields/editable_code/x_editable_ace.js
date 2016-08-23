import {Template} from 'meteor/templating';
import {Blaze} from 'meteor/blaze';

import './editable_code_editor.js';

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
    render: function() {
      var self  = this,
          data  = self.data || this.options.parentInstance.data,
          width = self.options.parentInstance.$(".editable").width() - 110;

      console.log("EditableAce.render: ", self.options.parentInstance.$(".editable").width());
      Blaze.renderWithData(Template.EditableCodeEditor, {
        value: data.value,
        width: width,
        minLines: data.minLines,
        maxLines: data.maxLines
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
    value2input: function(data) {
      // this is handled by the editor template
      var editor = Blaze.getView(this.$input.find(".roba-ace").get(0)).templateInstance().editor;
      if(editor){
        //console.log("xEditableAce.value2input:", data.value);
        editor.setValue(data.value);
        this.data = data;
      }
    },

    /**
     Returns value of input.

     @method input2value()
     **/
    input2value: function() {
      var value = Blaze.getView(this.$input.find(".roba-ace").get(0)).templateInstance().editor.getValue();
      //console.log("xEditableAce.input2value: ", value);
      return value;
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