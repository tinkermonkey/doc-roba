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
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureEditNodeForm.events({
  "edited .node-edit-form .editable": function (e, instance, newValue) {
    e.stopImmediatePropagation();
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
  "click .btn-preview": function (e, instance) {
    var field = $(e.target).closest(".btn").attr("data-field"),
      node = this,
      adventureContext = Template.parentData(1);
    console.log("Preview: ", field);

    // send the command to get information about the "clicked" element
    if(field && node[field] && _.contains([AdventureStatus.awaitingCommand], adventureContext.adventure.status)){
      AdventureCommands.insert({
        projectId: adventureContext.adventure.projectId,
        adventureId: adventureContext.adventure._id,
        updateState: false,
        code: "driver.previewCode(\"" + btoa(node[field]) + "\");"
      }, function (error) {
        if(error){
          Meteor.log.error("Error adding adventure command: " + error.message);
          Dialog.error("Error adding adventure command: " + error.message);
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
