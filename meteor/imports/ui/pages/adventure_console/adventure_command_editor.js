import './adventure_command_editor.html';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureCommands } from '../../../api/adventure/adventure_command.js';
import { AdventureStatus } from '../../../api/adventure/adventure_status.js';
import '../../components/roba_ace/roba_ace.js';

/**
 * Helpers
 */
Template.AdventureCommandEditor.helpers({
  isExecuting () {
    return this.adventure.status != AdventureStatus.complete
        && this.adventure.status != AdventureStatus.queued
        && this.adventure.status != AdventureStatus.staged
  }
});

/**
 * Helpers
 */
Template.AdventureCommandEditor.events({
  "click .btn-run-command" (e, instance) {
    console.log("btn-run: ", this);
    
    // make sure the adventure is operating
    if (instance.data.adventure.status == AdventureStatus.complete) {
      return;
    }
    
    // get the roba-ace instance for access to the editor
    try {
      var editorInstance = Blaze.getView(instance.$(".roba-ace").get(0)).templateInstance();
    } catch (e) {
      RobaDialog.error("Failed to get editor instance: " + e.message);
      return;
    }
    
    // make sure there's an adventure to work with
    var code = editorInstance.editor.getValue();
    
    console.log("runCommand: ", code);
    if (code.length) {
      AdventureCommands.insert({
        projectId  : instance.data.adventure.projectId,
        adventureId: instance.data.adventure._id,
        code       : code
      }, function (error) {
        if (error) {
          RobaDialog.error("Error adding adventure command: " + error.message);
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
Template.AdventureCommandEditor.onRendered( () =>  {
  
});