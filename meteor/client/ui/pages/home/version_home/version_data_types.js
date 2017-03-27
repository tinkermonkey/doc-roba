import './version_data_types.html';
import { Template } from 'meteor/templating';
import { DatastoreDataTypes } from '../../../../../imports/api/datastores/datastore_data_types.js';
import { Util } from '../../../../../imports/api/util.js';
import './version_data_type.js';

/**
 * Template Helpers
 */
Template.VersionDataTypes.helpers({
  dataTypes () {
    return DatastoreDataTypes.find({
      projectVersionId: this._id,
    }, { sort: { title: 1 } });
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
      title           : "New Type",
      projectId       : instance.data.projectId,
      projectVersionId: instance.data._id
    }, function (error, response) {
      if (error) {
        console.error("Custom Type insert failed: ", error);
      } else {
        console.log("Custom Type inserted: ", response);
      }
    });
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
});

/**
 * Template Destroyed
 */
Template.VersionDataTypes.onDestroyed(() => {
});
