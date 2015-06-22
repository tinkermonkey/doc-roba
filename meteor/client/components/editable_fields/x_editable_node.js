/**
 Node selector input

 @class nodeSelector
 @extends abstractinput
 @final
 **/
(function ($) {
  "use strict";

  var NodeSelector = function (options) {
    this.init('nodeSelector', options, NodeSelector.defaults);
  };

  $.fn.editableutils.inherit(NodeSelector, $.fn.editabletypes.abstractinput);

  $.extend(NodeSelector.prototype, {
    render: function() {
      console.log("NodeSelector: Render", this.$input.get(1));
      Blaze.renderWithData(Template.XEditableNodeSearch, {
        projectVersionId: this.options.projectVersionId
      }, this.$input.get(1));
    },

    cancel: function () {
      console.log("NodeSelector: cancel", Blaze.getView(this.$input.get(1)));
      Blaze.remove(Blaze.getView(this.$input.get(1)));
    },

    activate: function() {
      console.log("NodeSelector: Activate");
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
    tpl: '<input type="text" class="x-editable-node-value hide"><div class="x-editable-node-selector"></div>',

    /**
     @property projectVersionId
     @type string
     @default null
     **/
    projectVersionId: null
  });

  $.fn.editabletypes.nodeSelector = NodeSelector;

}(window.jQuery));