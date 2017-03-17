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
  let instance = Template.instance();
  
  instance.$(".editable").editable({
    type          : "editableAce",
    mode          : instance.data.mode || "popup",
    placement     : instance.data.placement || "auto",
    value         : instance.data.value,
    minHeight     : instance.data.minHeight || 60,
    language      : "xquery",
    parentInstance: instance,
    highlight     : false,
    onblur        : "ignore",
    display() {
    },
    success(response, newValue) {
      let editedElement = this;
      //console.log("EditableXpath callback:", response, newValue);
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
    let data = Template.currentData();
    //console.log('EditableXpath setting editor value:', data.value);
    instance.$(".editable").editable("setValue", data);
  });
});

/**
 * Template Destroyed
 */
Template.EditableXpath.onDestroyed(() => {
  
});
