/**
 * Template Helpers
 */
Template.action_edit_routes.helpers({
  indexedRoutes: function () {
    var indexedRoutes = _.map(this.routes, function (r, i) {r.index = i; return r; });
    return _.sortBy(indexedRoutes, function (r) { return r.order });
  },
  logic: function (action) {
    var logic = "else if";
    if(this.order == 0){
      logic = "if";
    } else if(this.order == action.routes.length - 1 && this.routeCode.length == 0) {
      logic = "else";
    }
    //console.log("Logic: ", this.order, action.routes.length, this.order == action.routes.length - 1, logic, this);
    return logic;
  },
  isLast: function (action) {
    //console.log("isLast: ", this.order == action.routes.length - 1, this);
    return this.order == action.routes.length - 1;
  }
});

/**
 * Template Helpers
 */
Template.action_edit_routes.events({
  "click .click-to-edit": function (e) {
    var instance = Template.instance(),
      row = $(e.target).closest(".action-route-row"),
      route = this;

    // make the editor visible
    $("#code-message-" + $(row).attr("data-pk") + "-" + route.index).addClass("hide");
    $("#action-route-editor-" + $(row).attr("data-pk") + "-" + route.index).removeClass("hide");
  },
  "click .btn-delete": function (e) {
    var instance = Template.instance(),
      route = this,
      source = Nodes.findOne({staticId: instance.data.nodeId, projectVersionId: instance.data.projectVersionId}),
      destination = Nodes.findOne({staticId: route.nodeId, projectVersionId: instance.data.projectVersionId});

    Dialog.show({
      title: "Delete Route?",
      contentTemplate: "confirm_delete_route_modal",
      contentData: { source: source, destination: destination },
      width: 400,
      buttons: [
        {text: "Cancel"},
        {text: "Delete"}
      ],
      callback: function (btn) {
        //console.log("Dialog button pressed: ", btn);
        if(btn == "Delete"){
          Actions.update(instance.data._id, { $pull: { routes: {order: route.order} } }, function (error, response) {
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
  }
});

/**
 * Template Rendered
 */
Template.action_edit_routes.rendered = function () {
  var instance = Template.instance(),
    action = Template.currentData();

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
        var actionId = instance.$(".action-route-row").attr("data-pk"),
          update = {$set: {}},
          updateKey;

        instance.$(".action-route-row").each(function (i, el) {
          updateKey = "routes." + parseInt($(el).attr("data-route-index")) + ".order";
          update["$set"][updateKey] = i;
        });

        Actions.update(actionId, update, function (error, response) {
          if(error){
            console.error("Action route order update failed: ", error);
            Dialog.error("Action route order update failed: " + error.message);
          }
        });
        instance.$(".sortable-table").sortable("cancel");
      }
    })
    .disableSelection();

  // Make the field list sortable
  instance.autorun(function () {
    var action = Template.currentData();

    instance.$(".sortable-table").sortable("refresh");
  });
};

/**
 * Template Destroyed
 */
Template.action_edit_routes.destroyed = function () {

};
