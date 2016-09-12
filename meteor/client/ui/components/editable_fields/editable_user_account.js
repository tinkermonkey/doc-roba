import './editable_user_account.html';

import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';

import {DSUtil} from '../../../../imports/api/datastore/ds_util.js'

/**
 * Template Helpers
 */
Template.EditableUserAccount.helpers({
  renderValue(){
    let options = Template.instance().options.get(),
        data = this;
    console.log("renderValue:", options, data.value);
    if(options && data.value){
      let row = _.find(options, (option) => { return option.value == data.value});
      if(row && row.text){
        return row.text;
      }
    }
    return data.value;
  }
});

/**
 * Template Event Handlers
 */
Template.EditableUserAccount.events({
  
});

/**
 * Template Created
 */
Template.EditableUserAccount.created = function () {
  let instance = Template.instance();
  instance.options = new ReactiveVar([]);
  
  instance.autorun(() => {
    let data = Template.currentData();
    if(data.userType && data.userType.dataStore){
      instance.options.set(data.userType.dataStore().getRenderedRows());
    }
  });
};

/**
 * Template Rendered
 */
Template.EditableUserAccount.rendered = function () {
  let instance = Template.instance();

  instance.autorun(function () {
    let data = Template.currentData(),
        options = instance.options.get();
    if(data.userType && data.userType._id && options){
      instance.$('.editable-user-account-selector').editable({
        mode: instance.data.mode || "inline",
        type: "select",
        source: options,
        highlight: false,
        display() {},
        success(response, newValue) {
          var editedElement = this;
          $(editedElement).trigger("edited", [newValue]);
          setTimeout(function () {
            $(editedElement).removeClass('editable-unsaved');
          }, 10);
        }
      });
      instance.$('.editable-user-account-selector').editable("option", "source", options);
      instance.$('.editable-user-account-selector').editable("setValue", data.value, true);
    }
  });
};

/**
 * Template Destroyed
 */
Template.EditableUserAccount.destroyed = function () {

};
