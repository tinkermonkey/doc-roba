import './version_user_types_config.html';

import {Template} from 'meteor/templating';

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
