import './version_user_types_config.html';

import {Template} from 'meteor/templating';

import {DataStores} from '../../../../api/datastore/datastore.js';

import {Util} from '../../../../api/util.js';
import '../../../components/data_stores/data_store_field_list.js';
import './components/version_custom_field_types.js';
import '../../../components/editable_fields/editable_code/editable_code.js';

/**
 * Template Helpers
 */
Template.VersionUserTypesConfig.helpers({
  getDataStore() {
    return DataStores.findOne({dataKey: this._id});
  },
  userTitleClean(){
    return Util.dataKey(this.title);
  }
});

/**
 * Template Helpers
 */
Template.VersionUserTypesConfig.events({});

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
