import './version_server_list.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { EditableTextField } from 'meteor/austinsand:editable-text-field';
import { TestServers } from '../../../../../../imports/api/test_server/test_server.js';
import '../../../../components/editable_fields/editable_autoform/editable_autoform.js';
import '../../../../components/editable_fields/editable_checkbox.js';

/**
 * Template Helpers
 */
Template.VersionServerList.helpers({
  sortedServers() {
    return TestServers.find({ projectVersionId: this._id }, { sort: { order: 1 } }).fetch();
  },
  configSchema() {
    let projectVersion = Template.parentData(1);
    return projectVersion.serverConfigDatastore().simpleSchema();
  }
});

/**
 * Template Helpers
 */
Template.VersionServerList.events({
  "click .btn-add-server"() {
    var instance       = Template.instance(),
        projectVersion = this,
        order          = instance.$(".server-list-row").length;
    
    TestServers.insert({
      projectId       : projectVersion.projectId,
      projectVersionId: projectVersion._id,
      title           : "New Server",
      url             : "HTTP://server.com",
      active          : true,
      order           : order
    });
  },
  "click .server-list-row .btn-delete"() {
    var server = this;
    
    RobaDialog.show({
      title  : "Delete Server?",
      text   : "Are you sure that you want to delete the server configuration <span class='label label-primary'>" + server.title + "</span> from this version?",
      width  : 400,
      buttons: [
        { text: "Cancel" },
        { text: "Delete" }
      ],
      callback(btn) {
        //console.log("Dialog button pressed: ", btn);
        if (btn == "Delete") {
          TestServers.remove(server._id, function (error, response) {
            RobaDialog.hide();
            if (error) {
              console.error("Delete failed: " + error.message);
              RobaDialog.error("Delete failed" + error.message);
            }
          });
        } else {
          RobaDialog.hide();
        }
      }
    });
  },
  "edited .editable"(e, instance, newValue) {
    e.stopImmediatePropagation();
    
    var serverId                = $(e.target).closest(".server-list-row").attr("data-pk"),
        dataKey                 = $(e.target).attr("data-key"),
        update                  = { $set: {} };
    update[ "$set" ][ dataKey ] = newValue;
    TestServers.update(serverId, update, function (error, response) {
      if (error) {
        console.error("Server update failed: " + error.message);
        RobaDialog.error("Server update failed: " + error.message);
      }
    });
  }
});

/**
 * Template Created
 */
Template.VersionServerList.created = function () {
  let instance          = Template.instance();
  instance.configSchema = new ReactiveVar({});
};

/**
 * Template Rendered
 */
Template.VersionServerList.rendered = function () {
  var instance = Template.instance();
  
  // Server list is sortable (manually)
  instance.$(".sortable-table")
      .sortable({
        items               : "> .sortable-table-row",
        handle              : ".drag-handle",
        helper(e, ui) {
          // fix the width
          ui.children().each(function () {
            $(this).width($(this).width());
          });
          return ui;
        },
        axis                : "y",
        forcePlaceholderSize: true,
        update(event, ui) {
          var order;
          instance.$(".server-list-row").each(function (i, el) {
            order = $(el).attr("data-sort-order");
            if (order != i) {
              console.log("Updating order: ", i, $(el).attr("data-pk"));
              TestServers.update($(el).attr("data-pk"), { $set: { order: i } }, function (error, response) {
                if (error) {
                  RobaDialog.error("Server order update failed: " + error.message);
                }
              });
            }
          });
        }
      })
      .disableSelection();
  
  // Make the field list sortable
  /*
   instance.autorun(function () {
   //var servers = TestServers.find({projectVersionId: instance.data.version._id});
   //instance.$(".sortable-table").sortable("refresh");
   });
   
   // Setup the config schema initial value
   instance.autorun(() => {
   console.log("VersionServerList.autorun - updating DatastoreSchemas");
   let projectVersionId = FlowRouter.getParam("projectVersionId"),
   projectVersion = ProjectVersions.findOne({_id: projectVersionId}),
   datastore = projectVersion.serverConfigDatastore();
   
   console.log("projectVersionId:", projectVersionId);
   console.log("projectVersion:", projectVersion);
   console.log("datastore:", datastore);
   DatastoreSchemas[datastore._id] = DSUtil.simpleSchema(datastore.schema);
   instance.configSchema.set(DatastoreSchemas[datastore._id]);
   });
   */
  /*
   var ds = Datastores.findOne({dataKey: "server_config_" + instance.data._id});
   if(ds.schema){
   DatastoreSchemas[ds._id] = DSUtil.simpleSchema(ds.schema);
   instance.configSchema.set(DatastoreSchemas[ds._id]);
   }
   */
  
  // Keep the server config simple schema up to date
  /*
   instance.configObservation = Datastores.find({dataKey: "server_config_" + instance.data._id}).observeChanges({
   changed(id, fields) {
   if(_.contains(fields, "schema")){
   DatastoreSchemas[id] = DSUtil.simpleSchema(fields.schema);
   instance.configSchema.set(DatastoreSchemas[id]);
   }
   }
   });
   */
};

/**
 * Template Destroyed
 */
Template.VersionServerList.destroyed = function () {
  //this.configObservation.stop();
};
