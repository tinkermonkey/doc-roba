import './version_home.html';

import {Template} from 'meteor/templating';

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

    Collections.DataStores.update(dataStoreId, update, function (error) {
      if(error){
        console.error("DataStore update failed: " + error.message);
        Dialog.error("DataStore update failed: " + error.message);
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
    instance.subscribe("data_stores", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("all_data_store_fields", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("all_data_store_rows", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("servers", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("test_systems", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("test_agents", projectId, projectVersionId);// TODO: Move to lower level template

    // pull in the project and project version records
    instance.project.set(Collections.Projects.findOne(projectId));
    instance.version.set(Collections.ProjectVersions.findOne(projectVersionId));
  });
};

/**
 * Template Rendered
 */
Template.VersionHome.rendered = function () {
  var instance = this;

  instance.autorun(function () {
    var ready = instance.subscriptionsReady(),
        version = instance.version.get();
    if(ready && version){
      Tabs.init(instance);
    }
  });
};

/**
 * Template Destroyed
 */
Template.VersionHome.destroyed = function () {
  
};
