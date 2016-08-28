import './editable_code.html';
import './editable_code.css';
import './x_editable_ace.js';

import {Template} from 'meteor/templating';
import {Blaze} from 'meteor/blaze';

var Prism = require('prismjs');
import '../../../../../node_modules/prismjs/themes/prism.css';

/**
 * Template Helpers
 */
Template.EditableCode.helpers({
});

/**
 * Template Event Handlers
 */
Template.EditableCode.events({

});

/**
 * Template Created
 */
Template.EditableCode.created = function () {
  
};

/**
 * Template Rendered
 */
Template.EditableCode.rendered = function () {
  var instance = Template.instance();

  instance.$(".editable").editable({
    type: "editableAce",
    mode: instance.data.mode || "popup",
    placement: instance.data.placement || "auto",
    data: instance.data,
    parentInstance: instance,
    highlight: false,
    onblur: "ignore",
    display: function () {},
    success: function (response, newValue) {
      var editedElement = this;
      $(editedElement).trigger("edited", [newValue]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });

  // This is needed to prevent re-use of an outdated context
  instance.$(".editable").on("hidden", function(e, reason) {
    if(instance.formView){
      setTimeout(function () {
        Blaze.remove(instance.formView);
      }, 100);
    }
  });

  // Watch for data changes and re-render
  instance.autorun(function () {
    var data = Template.currentData();
    instance.$(".editable").editable("setValue", data);
    if(data.value){
      instance.$('.code').html(Prism.highlight(data.value, Prism.languages.javascript));
    }
  });
};

/**
 * Template Destroyed
 */
Template.EditableCode.destroyed = function () {
  
};
