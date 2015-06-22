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
  },
  editorClass: function () {
    return "action-route-code" + (this.routeCode.length ? "" : " hide")
  },
  routeCodeDataKey: function () {
    return "routes." + this.index + ".routeCode";
  },
  routeNodeDataKey: function () {
    return "routes." + this.index + ".nodeId";
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
    row.find(".action-route-code").removeClass("hide");
  },
  "click .btn-delete": function (e, instance) {
    var route = this,
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
  },
  "click .btn-add-route": function (e, instance) {
    e.stopPropagation();
    var instance = Template.instance(),
      action = this;

    if(action && action.routes && action.routes.length){
      Actions.update(action._id, {
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
