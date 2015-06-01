/**
 * Template helpers
 */
Template.edit_action.helpers({
  getActionRecord: function () {
    return Actions.findOne({_id: this._id});
  },
  isExpanded: function () {
    return Session.get("drawerExpanded");
  },
  multipleDestinations: function () {
    return this.routes.length > 1;
  }
});

/**
 * Event Handlers
 */
Template.edit_action.events({
  "click .delete-action-link": function () {
    var action = this;
    console.log("Delete Action: ", action);

    Dialog.show({
      title: "Delete Action?",
      contentTemplate: "confirm_delete_action_modal",
      contentData: action,
      width: 400,
      buttons: [
        {text: "Cancel"},
        {text: "Delete"}
      ],
      callback: function (btn) {
        //console.log("Dialog button pressed: ", btn);
        if(btn == "Delete"){
          Actions.remove(action._id, function (error, result) {
            if(error) {
              Meteor.log.error("Failed to delete action: " + error.message);
              Dialog.hide();
              Dialog.error("Failed to delete action: " + error.message);
            } else {
              Meteor.log.debug("Action deleted: " + result);
              BottomDrawer.hide();
            }
            Dialog.hide();
          });
        } else {
          Dialog.hide();
        }
      }
    });

  }
});

/**
 * React to the template being rendered
 */
Template.edit_action.rendered = function () {
  var instance = Template.instance();

  instance.autorun(function () {
    var expanded = Session.get("drawerExpanded"),
      data = Template.currentData();

    console.log("Edit Action Autorun");
    if(!expanded){
      console.log("Updating tabs");
      setTimeout(function () {
        Tabs.init(instance);
        if(!instance.$("ul.nav > li.active").get(0)){
          console.log("Activating first tab");
          Tabs.activateFirst(instance);
        }
      }, 10);
    }
  });

  // Setup the editable content
  if(!instance.editable){
    Meteor.log.debug("Setting up x-editable behavior after render");
    instance.editable = instance.$('.editable').editable({
      mode: "inline",
      inputclass: "edit-node-title x-editable-auto",
      highlight: false,
      width: '100%',
      display: function () {},
      success: function (response, newValue) {
        var editedElement = this,
          actionId = $(editedElement).attr("data-pk");

        Actions.update(actionId, {$set: {title: newValue}}, function (error, response) {
          if(error){
            console.error("Action update failed: ", error);
          } else {
            console.log("Action updated: ", response);
          }
        });

        setTimeout(function () {
          $(editedElement).removeClass('editable-unsaved');
        }, 10);
      }
    });
  }
};
