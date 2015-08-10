/**
 * Template Helpers
 */
Template.VersionServerList.helpers({
  sortedServers: function () {
    return Servers.find({projectVersionId: this.version._id}, {sort: {order: 1}}).fetch();
  },
  getServerConfigVars: function () {
    if(this.config){
      var serverConfig = this.config,
        schema = Template.instance().configSchema.get();
      console.log("Schema: ", schema);
      return _.keys(this.config)
        .sort()
        .map(function (key) { return {
          key: key,
          value: serverConfig[key],
          label: schema && schema.schema ? schema.schema()[key].label : key
        } });
    }
  },
  hasConfig: function () {
    return this.config && _.keys(this.config).length;
  }
});

/**
 * Template Helpers
 */
Template.VersionServerList.events({
  "click .btn-add-server": function () {
    var instance = Template.instance(),
      order = instance.$(".server-list-row").length;
    Servers.insert({
      projectId: this.project._id,
      projectVersionId: this.version._id,
      title: "New Server",
      url: "HTTP://server.com",
      active: true,
      order: order
    });
  },
  "click .server-list-row .btn-delete": function () {
    var server = this;

    Dialog.show({
      title: "Delete Server?",
      text: "Are you sure that you want to delete the server configuration <span class='label label-primary'>" + server.title + "</span> from this version?",
      width: 400,
      buttons: [
        {text: "Cancel"},
        {text: "Delete"}
      ],
      callback: function (btn) {
        //console.log("Dialog button pressed: ", btn);
        if(btn == "Delete"){
          Servers.remove(server._id, function (error, response) {
            Dialog.hide();
            if(error){
              Meteor.log.error("Delete failed: " + error.message);
              Dialog.error("Delete failed" + error.message);
            }
          });
        } else {
          Dialog.hide();
        }
      }
    });
  },
  "edited .server-editable": function (e, instance, newValue) {
    var serverId = $(e.target).closest(".server-list-row").attr("data-pk"),
      dataKey = $(e.target).attr("data-key"),
      update = {$set: {}};
    update["$set"][dataKey] = newValue;
    Servers.update(serverId, update, function (error, response) {
      if(error){
        Meteor.log.error("Server update failed: " + error.message);
        Dialog.error("Server update failed: " + error.message);
      }
    });
  },
  "click .server-config-container": function (e, instance) {
    var server = this,
      rowSchema = instance.configSchema.get(),
      defaultConfig = {};

    // Merge in the fields defaults with the server config
    _.each(_.keys(rowSchema.schema()), function (field) {
      if(rowSchema.schema()[field].defaultValue){
        try {
          defaultConfig[field] = eval(rowSchema.schema()[field].defaultValue)
        } catch (e) {
          Meteor.log.error("Failed to interpret default value for [" + field + "]: " + e.toString());
        }
      }
    });
    console.log("Default config: ", defaultConfig);
    var config = _.defaults(server.config, defaultConfig);
    console.log("config: ", config);

    // Build the form context
    var formContext = {
      type: "update",
      rowSchema: rowSchema,
      rowData: config
    };

    // render the form
    Dialog.show({
      contentTemplate: 'DataStoreRowFormVert',
      contentData: formContext,
      title: server.title + " Configuration",
      width: 400,
      buttons: [
        { text: "Cancel" },
        { text: "Save" }
      ],
      callback: function (btn) {
        console.log("Dialog button pressed: ", btn);
        if(btn == "Save"){
          // grab the form data
          var formId = Dialog.currentInstance.$("form").attr("id");
          if(formId){
            // pull in the update doc from the form but reshape it to update the config field
            var rawUpdate = _.clone(AutoForm.getFormValues(formId).updateDoc),
              update = {
                $set: {config: rawUpdate.$set}
              };

            Servers.update(server._id, update, function (error, response) {
              Dialog.hide();
              if(error){
                Meteor.log.error("Config update failed: " + error.message);
                Dialog.error("Config update failed" + error.message);
              }
            });
          } else {
            Meteor.log.error("Delete failed: could not find form");
            Dialog.error("Delete failed: could not find form");
          }
        } else {
          Dialog.hide();
        }
      }
    });
  }
});

/**
 * Template Created
 */
Template.VersionServerList.created = function () {
  var instance = this;
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
      items: "> .sortable-table-row",
      handle: ".drag-handle",
      helper: function(e, ui) {
        // fix the width
        ui.children().each(function() {
          $(this).width($(this).width());
        });
        return ui;
      },
      axis: "y",
      forcePlaceholderSize: true,
      update: function (event, ui) {
        var order;
        instance.$(".server-list-row").each(function (i, el) {
          order = $(el).attr("data-sort-order");
          if(order != i){
            console.log("Updating order: ", i, $(el).attr("data-pk"));
            Servers.update($(el).attr("data-pk"), {$set: {order: i}}, function (error, response) {
              if(error){
                Meteor.log.error("Server order update failed: " + error.message);
                Dialog.error("Server order update failed: " + error.message);
              }
            });
          }
        });
      }
    })
    .disableSelection();

  // Make the field list sortable
  instance.autorun(function () {
    //var servers = Servers.find({projectVersionId: instance.data.version._id});
    //instance.$(".sortable-table").sortable("refresh");
  });

  // Setup the config schema initial valur
  var ds = DataStores.findOne({dataKey: "server_config_" + instance.data.version._id});
  DataStoreSchemas[ds._id] = DSUtil.simpleSchema(ds.schema);
  instance.configSchema.set(DataStoreSchemas[ds._id]);

  // Keep the server config simple schema up to date
  instance.configObservation = DataStores.find({dataKey: "server_config_" + instance.data.version._id}).observeChanges({
    changed: function (id, fields) {
      if(_.contains(fields, "schema")){
        DataStoreSchemas[id] = DSUtil.simpleSchema(fields.schema);
        instance.configSchema.set(DataStoreSchemas[id]);
      }
    }
  });
};

/**
 * Template Destroyed
 */
Template.VersionServerList.destroyed = function () {
  this.configObservation.stop();
};
