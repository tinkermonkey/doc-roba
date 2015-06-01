/**
 * Template Helpers
 */
Template.server_list.helpers({
  sortedServers: function () {
    return Servers.find({projectVersionId: this.version._id}, {sort: {order: 1}}).fetch();
  }
});

/**
 * Template Helpers
 */
Template.server_list.events({
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
              Meteor.log.error("Delete failed: ", error);
              Dialog.error(error.message);
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
        console.error("Server update failed: ", error);
        Dialog.error("Server update failed: " + error.message);
      }
    });
  }
});

/**
 * Template Rendered
 */
Template.server_list.rendered = function () {
  var instance = Template.instance();

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
                console.error("Server order update failed: ", error);
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
};

/**
 * Template Destroyed
 */
Template.server_list.destroyed = function () {

};
