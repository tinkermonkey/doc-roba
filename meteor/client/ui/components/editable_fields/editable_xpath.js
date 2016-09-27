import './editable_xpath.html';
import { Template } from 'meteor/templating';
import './editable_code/x_editable_ace.js';
import '../xpath/xpath.js';

/**
 * Template Helpers
 */
Template.EditableXpath.helpers({});

/**
 * Template Event Handlers
 */
Template.EditableXpath.events({});

/**
 * Template Created
 */
Template.EditableXpath.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.EditableXpath.onRendered(() => {
  var instance = Template.instance();
  
  instance.$(".editable").editable({
    type          : "text",
    mode          : instance.data.mode || "inline",
    placement     : instance.data.placement || "auto",
    data          : instance.data.value,
    parentInstance: instance,
    highlight     : false,
    onblur        : "ignore",
    display() {
    },
    success(response, newValue) {
      var editedElement = this;
      $(editedElement).trigger("edited", [ newValue ]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });
  
  // This is needed to prevent re-use of an outdated context
  /*
  instance.$(".editable").on("hidden", function () {
    if (instance.formView) {
      setTimeout(function () {
        Blaze.remove(instance.formView);
      }, 100);
    }
  });
  */
  
  // Watch for data changes and re-render
  instance.autorun(function () {
    var data = Template.currentData();
    instance.$(".editable").editable("setValue", data.value);
  });
});

/**
 * Template Destroyed
 */
Template.EditableXpath.onDestroyed(() => {
  
});
