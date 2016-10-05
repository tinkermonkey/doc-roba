import './editable_record_selector.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.EditableRecordSelector.helpers({
  renderValue(){
    let data     = this,
        instance = Template.instance(),
        match;
    
    if (data.value) {
      match = _.filter(instance.records.get(), (record) => { return record.value == data.value });
      if(match.length){
        return match[0].text
      }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.EditableRecordSelector.events({});

/**
 * Template Created
 */
Template.EditableRecordSelector.onCreated(() => {
  let instance     = Template.instance();
  instance.records = new ReactiveVar();
});

/**
 * Template Rendered
 */
Template.EditableRecordSelector.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(function () {
    console.log("EditableRecordSelector autorun");
    let data         = Template.currentData(),
        displayField = data.displayField || "title",
        valueField   = data.valueField || "staticId",
        query        = data.query || { projectVersionId: instance.data.projectVersionId },
        sort         = { sort: {} };
    
    // Determine the sort
    if (data.sort) {
      sort = data.sort
    } else {
      sort.sort[ displayField ] = 1
    }
    
    // Get the records
    if(data.collection){
      console.log("EditableRecordSelector fetching records");
      let records = data.collection.find(query, sort).map(function (result) {
        return { value: result[ valueField ], text: result[ displayField ] };
      });
      instance.records.set(records);
    }
    
    // Setup the editable
    instance.$('.editable-record-selector').editable({
      mode     : instance.data.mode || "inline",
      type     : "select",
      source   : instance.records.get(),
      highlight: false,
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
    
    // Update the editables if they already exist
    instance.$('.editable-record-selector').editable("option", "source", instance.records.get());
    instance.$('.editable-record-selector').editable("setValue", data.value, true);
  });
});

/**
 * Template Destroyed
 */
Template.EditableRecordSelector.onDestroyed(() => {
  
});
