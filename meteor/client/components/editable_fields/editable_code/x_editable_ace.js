/**
 Node selector input

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
    render: function() {
      console.log("EditableAce.render: ", this.$input);

      Blaze.renderWithData(Template.EditableCodeEditor, {
        value: this.options.data.value
      }, this.$input.get(0));

      // get the editor from the
      //this.editorView = Blaze.getView(this.$input.find(".roba-ace").get(0));
      //this.editor = this.editorView.templateInstance().editor;

      if(this.options.parentInstance){
        console.log("EditableAce.render: ", Blaze.getView(this.$input.find(".roba-ace").get(0)));
        this.options.parentInstance.formView = Blaze.getView(this.$input.find(".roba-ace").get(0));
      }
    },

    /**
     Sets value of input.

     @method value2input(value)
     @param {mixed} value
     **/
    value2input: function(value) {
      // this is handled by the editor template
    },

    /**
     Returns value of input.

     @method input2value()
     **/
    input2value: function() {
      console.log("input2value: ", Blaze.getView(this.$input.find(".roba-ace").get(0)).templateInstance().editor.getValue());
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