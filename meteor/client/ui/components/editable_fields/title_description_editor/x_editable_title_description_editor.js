/**
 Node selector input

 @class titleDescriptionEditor
 @extends abstractinput
 @final
 **/
(function ($) {
  "use strict";

  var TitleDescriptionEditor = function (options) {
    this.init("titleDescriptionEditor", options, TitleDescriptionEditor.defaults);
  };

  $.fn.editableutils.inherit(TitleDescriptionEditor, $.fn.editabletypes.abstractinput);

  $.extend(TitleDescriptionEditor.prototype, {
    render() {
      this.$input = this.$tpl.find("input,textarea");
    },

    /**
     Sets value of input.

     @method value2input(value)
     @param {mixed} value
     **/
    value2input(value) {
      console.log("value2input: ", value);
      if(!value) {
        return;
      }
      this.$input.filter('[name="title"]').val(value.title);
      this.$input.filter('[name="description"]').val(value.description);
    },

    /**
     Returns value of input.

     @method input2value()
     **/
    input2value() {
      return {
        title: this.$input.filter('[name="title"]').val(),
        description: this.$input.filter('[name="description"]').val()
      };
    }
  });

  TitleDescriptionEditor.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    /**
     @property tpl
     **/
    tpl:  '<div class="x-editable-title-description-editor">' +
            '<div>' +
              '<label>Title: </label>' +
              '<input type="text" name="title" class="form-control input-sm">' +
            '</div>' +
            '<div>' +
              '<label>Description: </label>' +
              '<textarea name="description" class="form-control input-sm" rows="7"></textarea>' +
            '</div>' +
          '</div>',

    /**
     @property projectVersionId
     @type string
     @default null
     **/
    projectVersionId: null,

    /**
     @property parentInstance
     @type object
     @default null
     **/
    parentInstance: null
  });

  $.fn.editabletypes.titleDescriptionEditor = TitleDescriptionEditor;

}(window.jQuery));