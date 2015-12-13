/**
 * Template Helpers
 */
Template.action_edit_routes.helpers({
  indexedRoutes: function () {
    var routes = this.routes,
      indexedRoutes = _.map(routes, function (r, i) {
        r.canDelete = routes.length - 1 > 0;
        r.index = i;
        r.codeDataKey = "routes." + r.index + ".routeCode";
        r.nodeDataKey = "routes." + r.index + ".nodeId";
        r.logic = "else if";
        r.emptyText = '<span class="label label-warning">Logic Required</span> Click to edit';

        if(i == routes.length - 1){
          r.logic = "else";
          r.emptyText = '<span class="label label-primary">Optional</span> If you chose to not add code for this action, it will be the default action when no other actions are selected.';
        }
        if(i == 0) {
          r.logic = "if";
        }
        return r;
    });
    return _.sortBy(indexedRoutes, function (r) { return r.order });
  }
});

/**
 * Template Helpers
 */
Template.action_edit_routes.events({
  "click .click-to-edit": function (e, instance) {
    var row = $(e.target).closest(".action-route-row");

    // make the editor visible
    row.find(".click-to-edit").addClass("hide");
    row.find(".action-editable").removeClass("hide");
  },
  "click .btn-delete": function (e, instance) {
    var route = this,
      source = Collections.Nodes.findOne({staticId: instance.data.nodeId, projectVersionId: instance.data.projectVersionId}),
      destination = Collections.Nodes.findOne({staticId: route.nodeId, projectVersionId: instance.data.projectVersionId});

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
          Collections.Actions.update(instance.data._id, { $pull: { routes: {order: route.order} } }, function (error, response) {
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
  "click .btn-add-route": function (e, instance) {
    e.stopImmediatePropagation();
    var instance = Template.instance(),
      action = this;

    if(action && action.routes && action.routes.length){
      Collections.Actions.update(action._id, {
        $push: {
          routes: {
            order: action.routes.length,
            nodeId: action.routes[action.routes.length-1].nodeId,
            routeCode: ""
          }
        }
      }, function (error, response) {
        if(error){
          Meteor.log.error("Route insert failed: " + error.message);
          Dialog.error("Route insert failed: " + error.message);
        } else {
          // trigger editing on the destination node
          setTimeout(function () {
            //instance.$(".sortable-table-row[data-route-order='" + order + "'] .editable[data-key='name']").editable("show");
          }, 100);
        }
      });
    } else {
      Meteor.log.error("Add Action Route failed: no action found");
      console.log(this);
      Dialog.error("Add Action Route failed: no action found");
    }
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

        Collections.Actions.update(actionId, update, function (error, response) {
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
