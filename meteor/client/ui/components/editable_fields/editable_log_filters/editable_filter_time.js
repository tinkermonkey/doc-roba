import './editable_filter_time.html';
import { Template } from 'meteor/templating';
import './x_editable_filter_time.js';

/**
 * Template Helpers
 */
Template.EditableFilterTime.helpers({
  hasValue () {
    let value = Template.instance().value.get();
    return value.start != null || value.end != null;
  }
});

/**
 * Template Event Handlers
 */
Template.EditableFilterTime.events({});

/**
 * Template Created
 */
Template.EditableFilterTime.onCreated(() => {
  let instance   = Template.instance();
  instance.value = new ReactiveVar({});
});

/**
 * Template Rendered
 */
Template.EditableFilterTime.onRendered(() => {
  let instance = Template.instance();
  
  instance.$(".editable").editable({
    type     : "editableFilterTime",
    mode     : instance.data.mode || "popup",
    placement: instance.data.placement || "auto",
    value    : instance.data.value,
    highlight: false,
    display () {
    },
    success (response, newValue) {
      console.log("EditableFilterTime edited: ", newValue);
      let editedElement = this;
      $(editedElement).trigger("edited", [ newValue ]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
      instance.value.set(newValue);
    }
  });
  
  instance.autorun(() => {
    let value = instance.value.get();
    instance.$(".editable").editable("setValue", value);
  });
});

/**
 * Template Destroyed
 */
Template.EditableFilterTime.onDestroyed(() => {
  
});
