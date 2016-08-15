/**
 * Template Helpers
 */
Template.AdventureEditNodeActionRow.helpers({
  actionWithScale: function () {
    this.scale = 0.5;
    return this;
  },
  getAdventureContext: function () {
    var i = 0, context = Template.parentData(i);
    while(i < 10 && context){
      context = Template.parentData(i++);
      if(context.adventure && context.adventure.status){
        return context;
      }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureEditNodeActionRow.events({
  "click .btn-edit-action": function (e, instance) {
    var action = this,
      actionRow = $(e.target).closest(".edit-node-action-row"),
      formRow = actionRow.next();

    if(formRow.hasClass("hide")){
      actionRow.addClass("disabled");
      formRow.removeClass("hide");
      Blaze.renderWithData(Template.AdventureEditActionForm, action, formRow.get(0));
      $(e.target).closest("button").attr("disabled", "disabled");
    }
  },
  "click .btn-execute-action": function (e, instance) {
    // make sure there's an adventure to work with
    var adventure = Util.findParentData("adventure"),
      code = this.code;

    // make sure the adventure is operating
    if(adventure.status == AdventureStatus.complete){
      return;
    }

    console.log("Execute Action: ", code);
    if(code.length){
      AdventureCommands.insert({
        projectId: adventure.projectId,
        adventureId: adventure._id,
        code: code
      }, function (error) {
        if(error){
          console.error("Error executing action: " + error.message);
          Dialog.error("Error executing action: " + error.message);
        }
      });
    }
  },
  "click .btn-delete-action": function () {
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
              console.error("Failed to delete action: " + error.message);
              Dialog.hide();
              Dialog.error("Failed to delete action: " + error.message);
            } else {
              console.debug("Action deleted: " + result);
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
 * Template Created
 */
Template.AdventureEditNodeActionRow.created = function () {
  
};

/**
 * Template Rendered
 */
Template.AdventureEditNodeActionRow.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.AdventureEditNodeActionRow.destroyed = function () {
  
};
