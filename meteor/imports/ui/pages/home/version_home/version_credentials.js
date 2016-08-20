import './version_credentials.html';

import {Template} from 'meteor/templating';

import {Nodes} from '../../../../api/node/node.js';
import {NodeTypes} from '../../../../api/node/node_types.js';
import {DataStores} from '../../../../api/datastore/datastore.js';

import '../../../components/data_stores/data_store_data_table.js';

/**
 * Template Helpers
 */
Template.VersionCredentials.helpers({
  userTypes: function () {
    return Nodes.find({projectVersionId: this._id, type: NodeTypes.userType}, {sort: {title: 1}});
  },
  getDataStore: function () {
    return DataStores.findOne({dataKey: this._id});
  }
});

/**
 * Template Helpers
 */
Template.VersionCredentials.events({});

/**
 * Template Created
 */
Template.VersionCredentials.created = function () {

};

/**
 * Template Rendered
 */
Template.VersionCredentials.rendered = function () {
};

/**
 * Template Destroyed
 */
Template.VersionCredentials.destroyed = function () {

};
