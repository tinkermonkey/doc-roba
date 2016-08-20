import './version_server_config.html';

import {Template} from 'meteor/templating';

import {DataStoreCategories} from '../../../../../api/datastore/datastore_catagories.js';
import {DataStores} from '../../../../../api/datastore/datastore.js';

import '../../../../components/data_stores/data_store_field_list.js';

/**
 * Template Helpers
 */
Template.VersionServerConfig.helpers({
  getDataStore: function () {
    var context = this,
      ds = DataStores.findOne({dataKey: "server_config_" + context._id});
    if(!ds){
      DataStores.insert({
        projectVersionId: context._id,
        projectId: context.projectId,
        dataKey: "server_config_" + context._id,
        title: context.project.title + " " + context.version + " server configuration",
        category: DataStoreCategories.serverConfig
      });
      ds = DataStores.findOne({dataKey: "server_config_" + context._id});
    }
    return ds;
  }
});

/**
 * Template Event Handlers
 */
Template.VersionServerConfig.events({});

/**
 * Template Created
 */
Template.VersionServerConfig.created = function () {
  
};

/**
 * Template Rendered
 */
Template.VersionServerConfig.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.VersionServerConfig.destroyed = function () {
  
};
