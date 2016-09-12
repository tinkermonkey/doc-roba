import './adventure_command_editor.html';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureStatus } from '../../../../imports/api/adventure/adventure_status.js';
import '../../components/roba_ace/roba_ace.js';

/**
 * Helpers
 */
Template.AdventureCommandEditor.helpers({
  isExecuting () {
    let adventure = this.adventure.get();
    return adventure.status != AdventureStatus.complete
        && adventure.status != AdventureStatus.queued
        && adventure.status != AdventureStatus.staged
  },
  commandExecuting(){
    return Template.instance().commandExecuting.get()
  }
});

/**
 * Helpers
 */
Template.AdventureCommandEditor.events({
  "click .btn-run-command" (e, instance) {
    let code      = instance.editor.getValue(),
        adventure = instance.data.adventure.get();
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    // make sure there's an adventure to work with
    
    if (code.length) {
      instance.commandExecuting.set(true);
      adventure.assistant().executeCommand(adventure, code, (error, command) => {
        instance.commandExecuting.set(false);
        if (error) {
          RobaDialog.error("Error adding adventure command: " + error.message);
        } else {
          instance.editor.setValue("");
          if (command.result.highlightElements) {
            console.log("instance.data:", instance.data);
            instance.data.highlightElements.set(command.result.highlightElements);
          }
        }
      });
    }
  }
});

/**
 * Template created
 */
Template.AdventureCommandEditor.onCreated(() => {
  let instance              = Template.instance();
  instance.commandExecuting = new ReactiveVar(false);
});

/**
 * Template rendered
 */
Template.AdventureCommandEditor.onRendered(() => {
  let instance = Template.instance();
  try {
    let editorInstance = Blaze.getView(instance.$(".roba-ace").get(0)).templateInstance();
    instance.editor    = editorInstance.editor;
  } catch (e) {
    console.error("Failed to get editor instance: ", e);
  }
});
