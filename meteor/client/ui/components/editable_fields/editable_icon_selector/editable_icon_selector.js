import './editable_icon_selector.html';
import './editable_icon_selector.css';
import { Template } from 'meteor/templating';
import './x_editable_icon_selector.js';

/**
 * Template Helpers
 */
Template.EditableIconSelector.helpers({
  icon(){
    console.log("icon:", IconList[ 0 ]);
    return IconList[ 0 ]
  }
});

/**
 * Template Event Handlers
 */
Template.EditableIconSelector.events({});

/**
 * Template Created
 */
Template.EditableIconSelector.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.EditableIconSelector.onRendered(() => {
  var instance = Template.instance();
  
  instance.$(".editable").editable({
    type            : "iconSelector",
    mode            : "popup",
    placement       : instance.data.placement || "auto",
    value           : instance.data.value,
    parentInstance  : instance,
    highlight       : false,
    display() {
    },
    success(response, newValue) {
      console.log("EditableIconSelector edited: ", newValue);
      var editedElement = this;
      $(editedElement).trigger("edited", [ newValue ]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });
  
  // this event listener needs to be registered directly
  instance.$(".editable").on("hidden", function () {
    if (instance.searchView) {
      setTimeout(function () {
        Blaze.remove(instance.searchView);
      }, 100);
    }
  });
  
  instance.autorun(function () {
    var data = Template.currentData();
    instance.$(".editable").editable("setValue", data.value);
  });
});

/**
 * Template Destroyed
 */
Template.EditableIconSelector.onDestroyed(() => {
  
});
