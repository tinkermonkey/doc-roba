/**
 * Template helpers
 */
Template.edit_action.helpers({
  getActionRecord: function () {
    return Actions.findOne({_id: this._id});
  }
});

/**
 * Event Handlers
 */
Template.edit_action.events({
  "edited .action-editable": function (e, instance, newValue) {
    e.stopImmediatePropagation();
    var dataKey = $(e.target).attr("data-key"),
      update = {$set: {}};

    console.log("update: ", dataKey, instance.data._id);
    if(dataKey){
      update["$set"][dataKey] = newValue;
      console.log("Updating action record: ", dataKey, newValue, update);
      Actions.update(instance.data._id, update, function (error) {
        if(error){
          console.error("Failed to update action value: " + error.message);
          console.log(update);
          RobaDialog.error("Failed to update action value: " + error.message);
        }
      });
    } else {
      console.error("Failed to update action value: data-key not found");
      RobaDialog.error("Failed to update action value: data-key not found");
    }
  },
  "click .delete-action-link": function () {
    var action = this;
    console.log("Delete Action: ", action);

    RobaDialog.show({
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
              console.error("Failed to delete action: " + error.message);
              RobaDialog.hide();
              RobaDialog.error("Failed to delete action: " + error.message);
            } else {
              console.debug("Action deleted: " + result);
            }
            RobaDialog.hide();
          });
        } else {
          RobaDialog.hide();
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
    var data = Template.currentData();

    setTimeout(function () {
      Tabs.init(instance);
      if(!instance.$("ul.nav > li.active").get(0)){
        console.log("Activating first tab");
        Tabs.activateFirst(instance);
      }
    }, 10);
  });
};