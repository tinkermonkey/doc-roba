import './editable_enum_selector.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Util } from '../../../../imports/api/util.js';

/**
 * Template Helpers
 */
Template.EditableEnumSelector.helpers({
  renderValue(){
    let lookup = Template.instance().lookup;
    if (lookup && this.value != undefined) {
      //console.log("EditableEnumSelector.renderValue: ", this.value, this);
      return Util.camelToTitle(lookup[ this.value ])
    }
  }
});

/**
 * Template Event Handlers
 */
Template.EditableEnumSelector.events({});

/**
 * Template Created
 */
Template.EditableEnumSelector.onCreated(() => {
  let instance = Template.instance();
  
  // translate the value key to the display key
  if (instance.data.displayKey) {
    instance.lookup = {};
    _.keys(instance.data.enum).forEach((key) => {
      let displayKey = instance.data.enum[key][instance.data.displayKey];
      instance.lookup[key] = displayKey;
    });
  } else {
    instance.lookup = _.invert(instance.data.enum);
  }
  //console.log("EditableEnumSelector.lookup:", instance.lookup);
});

/**
 * Template Rendered
 */
Template.EditableEnumSelector.onRendered(() => {
  let instance = Template.instance();
  
  instance.$('.editable-enum-selector').editable({
    mode     : instance.data.mode || "inline",
    type     : "select",
    source   : _.map(_.keys(instance.lookup), function (key) {
      return { value: key, text: Util.camelToTitle(instance.lookup[ key ]) };
    }),
    highlight: false,
    display() {
    },
    success(response, newValue) {
      var editedElement = this;
      
      if (instance.lookup[ newValue ]) {
        $(editedElement).trigger("edited", [ newValue ]);
      } else {
        RobaDialog.error("EditableEnumSelector change failed. Data key not known: " + newValue);
        console.log("EditableEnumSelector valid values:", instance.lookup, newValue);
      }
      
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });
  
  instance.autorun(() => {
    let data = Template.currentData();
    instance.$('.editable-enum-selector').editable("setValue", data.value);
  });
});

/**
 * Template Destroyed
 */
Template.EditableEnumSelector.onDestroyed(() => {
  
});
