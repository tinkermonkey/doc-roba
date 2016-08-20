import './version_credentials_config.html';

import {Template} from 'meteor/templating';

import {DataStores} from '../../../../api/datastore/datastore.js';

import '../../../components/data_stores/data_store_field_list.js';
import './components/version_custom_field_types.js';
import '../../../components/editable_fields/editable_code/editable_code.js';

/**
 * Template Helpers
 */
Template.VersionCredentialsConfig.helpers({
  getDataStore: function () {
    return DataStores.findOne({dataKey: this._id});
  }
});

/**
 * Template Helpers
 */
Template.VersionCredentialsConfig.events({});

/**
 * Template Rendered
 */
Template.VersionCredentialsConfig.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.VersionCredentialsConfig.destroyed = function () {

};
