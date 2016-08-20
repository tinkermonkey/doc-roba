import './editable_autoform.html';
import './editable_autoform.css';
import './x_editable_autoform.js';

import {Template} from 'meteor/templating';
import {Blaze} from 'meteor/blaze';

/**
 * Template Helpers
 */
Template.EditableAutoform.helpers({
  getDataVars: function () {
    if(this.data){
      var data = this.data,
        schema = this.schema;

      return _.keys(data)
        .sort()
        .map(function (key) { return {
          key: key,
          value: data[key],
          label: schema && schema.schema ? schema.schema()[key].label : key
        } });
    }
  },
  hasData: function () {
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
  var instance = this;

  instance.$(".editable").editable({
    type: "autoform",
    mode: instance.data.mode || "popup",
    placement: instance.data.placement || "auto",
    data: instance.data,
    parentInstance: instance,
    highlight: false,
    display: function () {},
    success: function (response, newValue) {
      var editedElement = this;
      $(editedElement).trigger("edited", [newValue]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });

  // this event listener needs to be registered directly
  instance.$(".editable").on("hidden", function(e, reason) {
    if(instance.formView){
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
