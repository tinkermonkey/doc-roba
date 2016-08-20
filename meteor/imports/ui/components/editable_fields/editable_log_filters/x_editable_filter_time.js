/**
 Filter time range editor
 
 @class editableFilterTime
 @extends abstractinput
 @final
 **/
(function ($) {
  "use strict";
  
  var editableFilterTime = function (options) {
    this.init("editableFilterTime", options, editableFilterTime.defaults);
  };
  
  $.fn.editableutils.inherit(editableFilterTime, $.fn.editabletypes.abstractinput);
  
  $.extend(editableFilterTime.prototype, {
    /**
     * Render the editor control
     */
    render: function() {
      this.$input = this.$tpl.find('input');
    },

    /**
     Activates input: sets focus on the first field.

     @method activate()
     **/
    activate: function() {
      this.$input.filter('[name="start"]').focus();
    },

    /**
     Sets value of input.
     
     @method value2input(value)
     @param {mixed} data
     **/
    value2input: function(value) {
      this.$input.filter('[name="start"]').val(value ? value.start : '');
      this.$input.filter('[name="end"]').val(value ? value.end : '');
    },
    
    /**
     Returns value of input.
     
     @method input2value()
     **/
    input2value: function() {
      return {
        start: this.$input.filter('[name="start"]').val() ? parseFloat(this.$input.filter('[name="start"]').val()) : null,
        end: this.$input.filter('[name="end"]').val() ? parseFloat(this.$input.filter('[name="end"]').val()) : null
      };
    }
  });
  
  editableFilterTime.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    /**
     @property tpl
     **/
    tpl: '<div><input type="number" name="start" class="form-control" placeholder="start"> <label>&lt;</label> '+
         '<input type="number" name="end" class="form-control" placeholder="end"></div>'
  });
  
  $.fn.editabletypes.editableFilterTime = editableFilterTime;
  
}(window.jQuery));