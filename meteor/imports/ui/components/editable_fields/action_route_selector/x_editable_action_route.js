/**
 Node selector input

 @class actionRouteSelector
 @extends abstractinput
 @final
 **/
(function ($) {
  "use strict";

  var ActionRouteSelector = function (options) {
    this.init("actionRouteSelector", options, ActionRouteSelector.defaults);
  };

  $.fn.editableutils.inherit(ActionRouteSelector, $.fn.editabletypes.abstractinput);

  $.extend(ActionRouteSelector.prototype, {
    render: function() {
      this.$input.parent().append('<div class="x-editable-action-route-selector"></div>');
      this.search = this.$input.parent().find(".x-editable-action-route-selector");

      Blaze.renderWithData(Template.XEditableActionRouteSelector, {
        projectVersionId: this.options.projectVersionId,
        nodeId: this.options.nodeId,
        xEditable: this
      }, this.search.get(0));

      if(this.options.parentInstance){
        this.options.parentInstance.selectorView = Blaze.getView( this.search.children().get(0) )
      }
    },

    /**
     Sets value of input.

     @method value2input(value)
     @param {mixed} value
     **/
    value2input: function(value) {
      if(!value) {
        return;
      }
      this.$input.filter('[name="actionId"]').val(value.actionId);
      this.$input.filter('[name="nodeId"]').val(value.nodeId);
    },

    /**
     Returns value of input.

     @method input2value()
     **/
    input2value: function() {
      return {
        actionId: this.$input.filter('[name="actionId"]').val(),
        nodeId: this.$input.filter('[name="nodeId"]').val()
      };
    }
  });

  ActionRouteSelector.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    /**
     @property tpl
     **/
    tpl: '<input type="hidden" name="actionId">' +
         '<input type="hidden" name="nodeId">',

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

  $.fn.editabletypes.actionRouteSelector = ActionRouteSelector;

}(window.jQuery));