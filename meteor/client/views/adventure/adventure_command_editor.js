/**
 * Helpers
 */
Template.AdventureCommandEditor.helpers({
  isExecuting: function () {
    return this.adventure.status != AdventureStatus.complete
      && this.adventure.status != AdventureStatus.queued
      && this.adventure.status != AdventureStatus.staged
  }
});

/**
 * Helpers
 */
Template.AdventureCommandEditor.events({
  "click .btn-run-command": function (e, instance) {
    console.log("btn-run: ", this);

    // make sure the adventure is operating
    if(instance.data.adventure.status == AdventureStatus.complete){
      return;
    }

    // get the roba-ace instance for access to the editor
    try {
      var editorInstance = Blaze.getView(instance.$(".roba-ace").get(0)).templateInstance();
    } catch (e) {
      Meteor.log.error("Failed to get editor instance: " + e.message);
      Dialog.error("Failed to get editor instance: " + e.message);
      return;
    }

    // make sure there's an adventure to work with
    var code = editorInstance.editor.getValue();

    console.log("runCommand: ", code);
    if(code.length){
      Collections.AdventureCommands.insert({
        projectId: instance.data.adventure.projectId,
        adventureId: instance.data.adventure._id,
        code: code
      }, function (error) {
        if(error){
          Meteor.log.error("Error adding adventure command: " + error.message);
          Dialog.error("Error adding adventure command: " + error.message);
        } else {
          editorInstance.editor.setValue("");
        }
      });
    }
  }
});

/**
 * Enable the Ace editor
 */
Template.AdventureCommandEditor.rendered = function (){

};
