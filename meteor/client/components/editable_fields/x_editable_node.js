/**
 Node selector input

 @class nodeSelector
 @extends abstractinput
 @final
 **/
(function ($) {
  "use strict";

  var NodeSelector = function (options) {
    this.init("nodeSelector", options, NodeSelector.defaults);
  };

  $.fn.editableutils.inherit(NodeSelector, $.fn.editabletypes.abstractinput);

  $.extend(NodeSelector.prototype, {
    render: function() {
      this.$input.parent().append('<div class="x-editable-node-selector"></div>');
      this.search = this.$input.parent().find(".x-editable-node-selector");

      // render the search form
      Blaze.renderWithData(Template.XEditableNodeSearch, {
        projectVersionId: this.options.projectVersionId,
        xEditable: this
      }, this.search.get(0));

      // store a link to the search form view
      this.options.parentInstance.searchView = Blaze.getView( this.search.get(0) )
    },

    activate: function() {
      if(this.$input.is(':visible')) {
        this.$input.focus();
        $.fn.editableutils.setCursorPosition(this.$input.get(0), this.$input.val().length);
      }
    }
  });

  NodeSelector.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    /**
     @property tpl
     @default <input type="text">
     **/
    tpl: '<input type="text" class="x-editable-node-value hide">',

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

  $.fn.editabletypes.nodeSelector = NodeSelector;

}(window.jQuery));