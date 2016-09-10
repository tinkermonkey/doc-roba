import './editable_autoform.html';
import './editable_autoform.css';
import './x_editable_autoform.js';

import {Template} from 'meteor/templating';
import {Blaze} from 'meteor/blaze';

/**
 * Template Helpers
 */
Template.EditableAutoform.helpers({
  getDataVars() {
    if (this.data) {
      //console.log("EditableAutoform context:", this.schema.schema());
      var data = this.data,
          schema = this.schema;
      
      return _.keys(data)
          .sort()
          .map((key) => {
            return {
              key: key,
              value: data[key],
              label: schema && schema.schema && schema.schema()[key] ? schema.schema()[key].label : key
            }
          });
    }
  },
  hasData() {
    return this.data && _.keys(this.data).length;
  }
});

/**
 * Template Event Handlers
 */
Template.EditableAutoform.events({});

/**
 * Template Created
 */
Template.EditableAutoform.created = function () {
  
};

/**
 * Template Rendered
 */
Template.EditableAutoform.rendered = function () {
  let instance = Template.instance();
  
  instance.$(".editable").editable({
    type: "autoform",
    mode: instance.data.mode || "popup",
    placement: instance.data.placement || "auto",
    data: instance.data,
    parentInstance: instance,
    highlight: false,
    display() {
    },
    success(response, newValue) {
      var editedElement = this;
      $(editedElement).trigger("edited", [newValue]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });
  
  // this event listener needs to be registered directly
  instance.$(".editable").on("hidden", function () {
    if (instance.formView) {
      setTimeout(function () {
        Blaze.remove(instance.formView);
      }, 100);
    }
  });
  
  instance.autorun(function () {
    var data = Template.currentData();
    instance.$(".editable").editable("option", "data", data);
  });
};

/**
 * Template Destroyed
 */
Template.EditableAutoform.destroyed = function () {
  
};
