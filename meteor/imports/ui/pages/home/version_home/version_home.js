import './version_home.html';
import '../home.css';

import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';

import {Datastores} from '../../../../api/datastore/datastore.js';
import {Projects} from '../../../../api/project/project.js';
import {ProjectVersions} from '../../../../api/project/project_version.js';

import '../../../components/page_headers/current_project_header.js';
import '../home_nav.js';
import './version_activity.js';
import './version_code_modules.js';
import './version_credentials.js';
import './version_user_types_config.js';
import './version_data_types.js';
import './version_servers.js';
import './version_test_systems.js';

/**
 * Template Helpers
 */
Template.VersionHome.helpers({
  project: function () {
    return Template.instance().project.get()
  },
  version: function () {
    return Template.instance().version.get()
  }
});

/**
 * Template Event Handlers
 */
Template.VersionHome.events({
  "edited .editable": function (e, instance, newValue) {
    console.log("Edited:", $(e.target).attr("data-key"), e.target);
    e.stopImmediatePropagation();
  
    var dataStoreId = $(e.target).closest(".user-type-data-store").attr("data-pk"),
        dataKey = $(e.target).attr("data-key"),
        update = {$set: {}};
    update["$set"][dataKey] = newValue;

    Datastores.update(dataStoreId, update, function (error) {
      if(error){
        console.error("Datastore update failed: " + error.message);
        RobaDialog.error("Datastore update failed: " + error.message);
      }
    });
  }
});

/**
 * Template Created
 */
Template.VersionHome.created = function () {
  var instance = this;
  instance.project = new ReactiveVar();
  instance.version = new ReactiveVar();

  instance.autorun(function () {
    var projectId = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");

    instance.subscribe("nodes", projectId, projectVersionId);
    instance.subscribe("actions", projectId, projectVersionId);
    instance.subscribe("datastores", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("datastore_data_types", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("all_datastore_fields", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("all_datastore_data_type_fields", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("all_datastore_rows", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("servers", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("test_systems", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("test_agents", projectId, projectVersionId);// TODO: Move to lower level template

    // pull in the project and project version records
    instance.project.set(Projects.findOne(projectId));
    instance.version.set(ProjectVersions.findOne(projectVersionId));
  });
};

/**
 * Template Rendered
 */
Template.VersionHome.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.VersionHome.destroyed = function () {
  
};
