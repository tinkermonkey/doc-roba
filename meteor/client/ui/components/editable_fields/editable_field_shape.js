import './editable_field_shape.html';

import {Template} from 'meteor/templating';

/**
 * Template Helpers
 */
Template.EditableFieldShape.helpers({});

/**
 * Template Helpers
 */
Template.EditableFieldShape.events({});

/**
 * Template Rendered
 */
Template.EditableFieldShape.rendered = function () {
  var instance = Template.instance();

  instance.$('.editable-is-array').editable({
    mode: instance.data.mode || "inline",
    type: "select",
    source: [{value: 0, text: 'Scalar'}, {value: 1, text: 'Array'}],
    value: instance.data.fieldIsArray ? 1 : 0,
    highlight: false,
    display() {},
    success(response, newValue) {
      var editedElement = this;
      $(editedElement).trigger("edited", [newValue == 1]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });

  instance.autorun(function () {
    var data = Template.currentData();
    instance.$(".editable-is-array").editable("setValue", data.fieldIsArray ? 1 : 0);
  });

};

/**
 * Template Destroyed
 */
Template.EditableFieldShape.destroyed = function () {

};
