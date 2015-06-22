/**
 * Template helpers
 */
Template.edit_node.helpers({
  getNodeRecord: function () {
    return Nodes.findOne({_id: this._id});
  },
  isVisitable: function () {
    return this.type == NodeTypes.page || this.type == NodeTypes.view
  }
});

/**
 * React to the template being rendered
 */
Template.edit_node.events({
  "edited .editable": function (e, instance, newValue) {
    e.stopPropagation();
    var dataKey = $(e.target).attr("data-key"),
      update = {$set: {}};

    console.log("update: ", dataKey, instance.data._id);
    if(dataKey){
      update["$set"][dataKey] = newValue;
      Nodes.update(instance.data._id, update, function (error) {
        if(error){
          Meteor.log.error("Failed to update node value: " + error.message);
          Dialog.error("Failed to update node value: " + error.message);
        }
      });
    } else {
      Meteor.log.error("Failed to update node value: data-key not found");
      Dialog.error("Failed to update node value: data-key not found");
    }
  },
  "click .btn-add-url-parameter": function (e, instance) {
    var node = this;
    Nodes.update(instance.data._id, {
      $push: {
        urlParameters: {
          order: node.urlParameters ? node.urlParameters.length : 0,
          param: "parameter",
          value: "value"
        }
      }
    }, function (error) {
      if(error){
        Meteor.log.error("Failed to add node url parameter: " + error.message);
        Dialog.error("Failed to add node url parameter: " + error.message);
      }
    });
  },
  "click .node-url-parameter .btn-delete": function (e, instance) {
    var parameter = this,
      index = $(e.target).closest(".node-url-parameter").attr("data-index");

    Dialog.show({
      title: "Delete Parameter?",
      text: "Are you sure you want to delete the identifying url parameter <span class='label label-primary'>" + parameter.param + "</span> from this node?",
      width: 400,
      buttons: [
        {text: "Cancel"},
        {text: "Delete"}
      ],
      callback: function (btn) {
        //console.log("Dialog button pressed: ", btn);
        if(btn == "Delete"){
          Nodes.update(instance.data._id, { $pull: { urlParameters: {order: parameter.order} } }, function (error) {
            Dialog.hide();
            if(error){
              Meteor.log.error("Delete failed: " + error.message);
              Dialog.error("Delete failed: " + error.message);
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
 * Set the editable components
 */
Template.edit_node.rendered = function () {
  var instance = Template.instance();
  Tabs.init(instance).activateFirst(instance);
};

/**
 * React to the template being destroyed
 */
Template.edit_node.destroyed = function () {
};