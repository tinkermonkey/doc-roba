import {Template} from 'meteor/templating';
import {Blaze} from 'meteor/blaze';
import {Autoform} from 'meteor/aldeed:autoform';
import '../../datastores/datastore_row_form_vert.js';

/**
 Node selector input

 @class autoform
 @extends abstractinput
 @final
 **/
(function ($) {
  "use strict";
  
  var Autoform = function (options) {
    this.init("autoform", options, Autoform.defaults);
  };
  
  $.fn.editableutils.inherit(Autoform, $.fn.editabletypes.abstractinput);
  
  $.extend(Autoform.prototype, {
    render: function() {
      this.form = this.$input.parent().find(".x-editable-autoform");
      this.$input.closest("form").removeClass("form-inline");

      Blaze.renderWithData(Template.DatastoreRowForm, {
        type: "update",
        rowSchema: this.options.data.schema,
        rowData: this.options.data.data
      }, this.form.get(0));
      this.form.find(".form-inline").removeClass("form-inline");

      if(this.options.parentInstance){
        this.options.parentInstance.formView = Blaze.getView( this.form.children().get(0) )
      }
    },
    
    /**
     Sets value of input.
    
     @method value2input(value)
     @param {mixed} value
     **/
    value2input: function(value) {
      // this is handled by the form template
    },
    
    /**
     Returns value of input.
    
     @method input2value()
     **/
    input2value: function() {
      var formId = this.$input.find("form").attr("id");
      return _.clone(AutoForm.getFormValues(formId).updateDoc).$set;
    }
  });
  
  Autoform.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    /**
     @property tpl
     **/
    tpl:  '<div class="x-editable-autoform"></div>',

    /**
     @property parentInstance
     @type object
     @default null
     **/
    parentInstance: null
  });
  
  $.fn.editabletypes.autoform = Autoform;
  
}(window.jQuery));