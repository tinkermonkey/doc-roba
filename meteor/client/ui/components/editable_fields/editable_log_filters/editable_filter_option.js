import './editable_filter_option.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.EditableFilterOption.helpers({
  hasValue () {
    let value = Template.instance().value.get();
    return value != null;
  }
});

/**
 * Template Event Handlers
 */
Template.EditableFilterOption.events({});

/**
 * Template Created
 */
Template.EditableFilterOption.onCreated(() => {
  let instance   = Template.instance();
  instance.value = new ReactiveVar();
});

/**
 * Template Rendered
 */
Template.EditableFilterOption.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(function () {
    let data         = Template.currentData(),
        currentValue = instance.value.get(),
        options      = _.map(_.uniq(data.messages.map((message) => {
          return message[ data.dataKey ]
        })).sort(), (option) => {
          return { value: option, text: option };
        });
    
    //console.log("EditableFilterOption:", options);
    if (!instance.editable) {
      instance.editable = instance.$('.editable').editable({
        mode     : data.mode || "popup",
        type     : "checklist",
        source   : options,
        placement: instance.data.placement || "auto",
        highlight: false,
        display () {
        },
        success (response, newValue) {
          let editedElement = this;
          $(editedElement).trigger("edited", [ newValue ]);
          setTimeout(function () {
            $(editedElement).removeClass('editable-unsaved');
          }, 10);
          instance.value.set(newValue);
        }
      });
    }
    instance.$('.editable').editable("option", "source", options);
    instance.$('.editable').editable("setValue", currentValue ? currentValue.join(",") : '', true);
  });
});

/**
 * Template Destroyed
 */
Template.EditableFilterOption.onDestroyed(() => {
  
});
