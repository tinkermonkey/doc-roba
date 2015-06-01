/**
 * AdventureNodeEditForm
 *
 * Created by austinsand on 4/18/15
 *
 */

/**
 * Template Helpers
 */
Template.AdventureEditNodeForm.helpers({
  isMatch: function (node, data) {
    if(node && data){
      var result = NodeSearch.compareNode(data.state.url, data.state.title, node);
      return result.url.match && result.params.match && result.title.match;
    }
  },
  nodeComparison: function (node, data) {
    if(node && data) {
      var result = NodeSearch.compareNode(data.state.url, data.state.title, node);
      return result;
    }
  },
  getActions: function () {
    return Actions.find({nodeId: this.staticId, projectVersionId: this.projectVersionId}, {sort: {title: 1}})
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureEditNodeForm.events({
  "edited .node-edit-form .editable": function (e, instance, newValue) {
    var target = $(e.target),
      dataKey = target.attr("data-key"),
      update = {$set: {}};

    console.log("update: ", dataKey, instance.data._id);
    if(dataKey){
      update["$set"][dataKey] = newValue;
      //console.log("Edited: ", dataKey, newValue, node);
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

    Nodes.update(node._id, {
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
      index = $(e.target).closest(".node-url-parameter").attr("data-index"),
      nodeId = instance.data.currentNode.get();

    var node = Nodes.findOne({staticId: nodeId, projectVersionId: instance.data.adventure.projectVersionId});

    if(!node){
      Meteor.log.error("Failed to update node value: node not found");
      Dialog.error("Failed to update node value: node not found");
      return;
    }

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
          Nodes.update(node._id, { $pull: { urlParameters: {order: parameter.order} } }, function (error) {
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
  },
  "click .btn-edit-action": function (e, instance) {
    console.log("Edit Action: ", this);
  },
  "click .btn-execute-action": function (e, instance) {
    // make sure there's an adventure to work with
    var adventureContext = Template.parentData(1),
      code = this.code;

    // make sure the adventure is operating
    if(adventureContext.adventure.status == AdventureStatus.complete){
      return;
    }

    console.log("Execute Action: ", code);
    if(code.length){
      AdventureCommands.insert({
        projectId: adventureContext.adventure.projectId,
        adventureId: adventureContext.adventure._id,
        code: code
      }, function (error) {
        if(error){
          Meteor.log.error("Error executing action: " + error.message);
          Dialog.error("Error executing action: " + error.message);
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.AdventureEditNodeForm.created = function () {

};

/**
 * Template Rendered
 */
Template.AdventureEditNodeForm.rendered = function () {
  var instance = Template.instance();

  // node click to designate as current node
  instance.$(".btn-wrong-node").popover({
    placement: 'left',
    trigger: 'hover',
    html: true,
    delay: 500
  });
};

/**
 * Template Destroyed
 */
Template.AdventureEditNodeForm.destroyed = function () {

};
