import './version_data_types.html';

import {Template} from 'meteor/templating';

import {DatastoreDataTypes} from '../../../../../imports/api/datastores/datastore_data_types.js';
import {DatastoreCategories} from '../../../../../imports/api/datastores/datastore_catagories.js';

import {Util} from '../../../../../imports/api/util.js';
import '../../../components/datastores/datastore_data_type_field_list.js';

/**
 * Template Helpers
 */
Template.VersionDataTypes.helpers({
  dataTypes () {
    return DatastoreDataTypes.find({
      projectVersionId: this._id,
    }, {sort: {title: 1}});
  },
  getTabName () {
    return Util.dataKey(this.title);
  }
});

/**
 * Template Event Handlers
 */
Template.VersionDataTypes.events({
  "click .btn-add-custom-type"(event, instance) {
    DatastoreDataTypes.insert({
      title: "New Type",
      projectId: instance.data.projectId,
      projectVersionId: instance.data._id
    }, function (error, response) {
      if(error){
        console.error("Custom Type insert failed: ", error);
      } else {
        console.log("Custom Type inserted: ", response);
      }
    });
  },
  "click .btn-delete-custom-type"(event) {
    var dataTypeId = $(event.target).attr("data-store-id");
    if(dataTypeId){
      DatastoreDataTypes.remove({_id: dataTypeId}, function (error, response) {
        if(error){
          console.error("Data Type delete failed: ", error);
        } else {
          console.log("Data Type deleted: ", response);
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.VersionDataTypes.onCreated(() => {
});

/**
 * Template Rendered
 */
Template.VersionDataTypes.onRendered(() => {
  var instance = Template.instance();
  
  updateDatastoreNameEditable(instance);
  
  // Update the editables if the list of custom types changes
  DatastoreDataTypes.find({projectVersionId: instance.data.version._id}).observeChanges({
    added() {
      updateDatastoreNameEditable(instance);
    }
  });
});

/**
 * Template Destroyed
 */
Template.VersionDataTypes.onDestroyed(() => {
  
});

/**
 * Update the x-editable functionality for the tabs
 * @param instance
 */
var updateDatastoreNameEditable = function (instance) {
  // Initialize the x-editable functionality for the field titles
  instance.$('.data-store-name-editable').editable({
    mode: "inline",
    highlight: false,
    display() {},
    success(response, newValue) {
      var editedElement = this,
          dataStoreId = $(editedElement).attr("data-pk");
      
      if(dataStoreId){
        DatastoreDataTypes.update({_id: dataStoreId}, {$set: {title: newValue}});
      }
      
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });
};
