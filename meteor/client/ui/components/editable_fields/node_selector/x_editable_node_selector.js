import {Blaze} from 'meteor/blaze';
import {Template} from 'meteor/templating';

import './x_editable_node_search.js';

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
    render() {
      this.$input.parent().append('<div class="x-editable-node-selector"></div>');
      this.search = this.$input.parent().find(".x-editable-node-selector");

      Blaze.renderWithData(Template.XEditableNodeSearch, {
        projectVersionId: this.options.projectVersionId,
        xEditable: this
      }, this.search.get(0));

      if(this.options.parentInstance){
        this.options.parentInstance.searchView = Blaze.getView( this.search.children().get(0) )
      }
    }
  });

  NodeSelector.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
    /**
     @property tpl
     @default <input type="text">
     **/
    tpl: '<input type="hidden" class="x-editable-node-value">',

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