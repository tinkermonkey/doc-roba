import './version_user_types_config.html';

import {Template} from 'meteor/templating';

import {Datastores} from '../../../../api/datastore/datastore.js';

import {Util} from '../../../../api/util.js';
import '../../../components/datastores/datastore_field_list.js';
import '../../../components/editable_fields/editable_code/editable_code.js';

/**
 * Template Helpers
 */
Template.VersionUserTypesConfig.helpers({
  userTitleClean(){
    return Util.dataKey(this.title);
  }
});

/**
 * Template Helpers
 */
Template.VersionUserTypesConfig.events({
  "edited .editable": function (e, instance, newValue) {
    console.log("Edited:", $(e.target).attr("data-key"), e.target);
    e.stopImmediatePropagation();
    
    var dataStoreId = $(e.target).closest(".user-type-data-store").attr("data-pk"),
        dataKey = $(e.target).attr("data-key"),
        update = {$set: {}};
    update["$set"][dataKey] = newValue;
    
    if(dataStoreId){
      Datastores.update(dataStoreId, update, function (error, response) {
        if(error){
          console.error("Datastore update failed: " + error.message);
          RobaDialog.error("Datastore update failed: " + error.message);
        }
      });
    } else {
      console.error("VersionUserTypesConfig.edited handler: DatastoreId not found:", dataKey, newValue);
    }
  }
});

/**
 * Template Rendered
 */
Template.VersionUserTypesConfig.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.VersionUserTypesConfig.destroyed = function () {

};
