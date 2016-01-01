/**
 * Template Helpers
 */
Template.VersionServerList.helpers({
  sortedServers: function () {
    return Collections.Servers.find({projectVersionId: this._id}, {sort: {order: 1}}).fetch();
  },
  getConfigSchema: function () {
    return Template.instance().configSchema.get();
  }
});

/**
 * Template Helpers
 */
Template.VersionServerList.events({
  "click .btn-add-server": function () {
    var instance = Template.instance(),
        projectVersion = this,
        order = instance.$(".server-list-row").length;
    Collections.Servers.insert({
      projectId: projectVersion.projectId,
      projectVersionId: projectVersion._id,
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
          Collections.Servers.remove(server._id, function (error, response) {
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
  "edited .editable": function (e, instance, newValue) {
    var serverId = $(e.target).closest(".server-list-row").attr("data-pk"),
      dataKey = $(e.target).attr("data-key"),
      update = {$set: {}};
    update["$set"][dataKey] = newValue;
    Collections.Servers.update(serverId, update, function (error, response) {
      if(error){
        Meteor.log.error("Server update failed: " + error.message);
        Dialog.error("Server update failed: " + error.message);
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
            Collections.Servers.update($(el).attr("data-pk"), {$set: {order: i}}, function (error, response) {
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
  var ds = Collections.DataStores.findOne({dataKey: "server_config_" + instance.data._id});
  DataStoreSchemas[ds._id] = DSUtil.simpleSchema(ds.schema);
  instance.configSchema.set(DataStoreSchemas[ds._id]);

  // Keep the server config simple schema up to date
  instance.configObservation = Collections.DataStores.find({dataKey: "server_config_" + instance.data._id}).observeChanges({
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
