import './version_data_type.html';
import { Template } from 'meteor/templating';
import { DatastoreDataTypes } from '../../../../../imports/api/datastores/datastore_data_types.js';
import '../../../components/datastores/datastore_data_type_field_list.js';

/**
 * Template Helpers
 */
Template.VersionDataType.helpers({});

/**
 * Template Event Handlers
 */
Template.VersionDataType.events({
  "edited .editable"(e, instance, newValue){
    e.stopImmediatePropagation();
    let dataStoreId = $(e.target).closest(".version-data-type").attr("data-pk"),
        dataKey     = $(e.target).attr("data-key"),
        update      = { $set: {} };
    
    if(dataKey === "title" && !newValue.length){
      console.error('Updating DatastoreDataTypes, title cannot be null:', dataKey, newValue);
      return;
    }
    
    console.log('Updating DatastoreDataTypes:', dataKey, newValue);
    update[ "$set" ][ dataKey ] = newValue;
    
    DatastoreDataTypes.update({ _id: dataStoreId }, update, (error) => {
      if (error) {
        RobaDialog.error("Datastore title update failed: " + error.message);
      }
    });
  },
  "click .btn-delete-custom-type"(event) {
    let dataTypeId = $(event.target).closest(".version-data-type").attr("data-pk");
    if (dataTypeId) {
      RobaDialog.ask("Delete Data Type?", "Are you sure that you want to delete this data type record from this project? All records of this type will be removed.", () => {
        DatastoreDataTypes.remove({ _id: dataTypeId }, function (error, response) {
          if (error) {
            console.error("Data Type delete failed: ", error);
          } else {
            console.log("Data Type deleted: ", response);
          }
        });
      });
    }
  }
});

/**
 * Template Created
 */
Template.VersionDataType.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.VersionDataType.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.VersionDataType.onDestroyed(() => {
  
});
