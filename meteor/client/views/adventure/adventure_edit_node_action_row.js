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
      formRow = $(e.target).closest("tr").next();
    if(formRow.hasClass("hide")){
      formRow.removeClass("hide");
      Blaze.renderWithData(Template.AdventureEditActionForm, action, formRow.find("td").get(0));
      $(e.target).attr("disabled", "disabled");
    }
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
