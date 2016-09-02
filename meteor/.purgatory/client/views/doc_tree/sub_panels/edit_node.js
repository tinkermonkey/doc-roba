/**
 * Template helpers
 */
Template.edit_node.helpers({
  getNodeRecord: function () {
    return Nodes.findOne({_id: this._id});
  },
  isVisitable: function () {
    return this.type == NodeTypes.page || this.type == NodeTypes.view
  },
  getEditPanel: function () {
    switch (this.type) {
      case NodeTypes.root:
        return "RootEditPanel";
      case NodeTypes.userType:
        return "UserTypeEditPanel";
      case NodeTypes.platform:
        return "PlatformEditPanel";
      case NodeTypes.navMenu:
        return "NavMenuEditPanel";
      case NodeTypes.page:
      case NodeTypes.view:
        return "PageViewEditPanel";
    }
  }
});

/**
 * React to the template being rendered
 */
Template.edit_node.events({
  "edited .editable": function (e, instance, newValue) {
    e.stopImmediatePropagation();
    var dataKey = $(e.target).attr("data-key"),
      update = {$set: {}};

    console.log("update: ", dataKey, instance.data._id);
    if(dataKey){
      update["$set"][dataKey] = newValue;
      Nodes.update(instance.data._id, update, function (error) {
        if(error){
          console.error("Failed to update node value: " + error.message);
          RobaDialog.error("Failed to update node value: " + error.message);
        }
      });
    } else {
      console.error("Failed to update node value: data-key not found");
      RobaDialog.error("Failed to update node value: data-key not found");
    }
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