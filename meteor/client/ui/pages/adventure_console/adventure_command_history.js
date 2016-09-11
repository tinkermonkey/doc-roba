import './adventure_command_history.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureCommands } from '../../../../imports/api/adventure/adventure_command.js';
import { AdventureStepStatus } from '../../../../imports/api/adventure/adventure_step_status.js';

/**
 * Helpers
 */
Template.AdventureCommandHistory.helpers({
  getCommands () {
    if (this.adventure._id) {
      var count = Template.instance().historyLength.get();
      return AdventureCommands.find({ adventureId: this.adventure._id }, { sort: { dateCreated: -1 } });
    }
  },
  formatResult () {
    if (this.result) {
      return JSON.stringify(this.result, null, "\t").substring(0, 150);
    }
  },
  complete () {
    return this.status == AdventureStepStatus.complete || Date.now() - this.dateCreated > 20000;
  }
});

/**
 * Event Handlers
 */
Template.AdventureCommandHistory.events({
  "click .result-toggle" (e) {
    var expanded = $(e.target).parent().hasClass("expanded");
    if (!expanded) {
      $(e.target).parent().addClass("expanded");
      $(e.target).removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
    } else {
      $(e.target).parent().removeClass("expanded");
      $(e.target).removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    }
  },
  "click .btn-copy-command" (e, instance) {
    var result = this;
    console.log("Copy command: ", result.code);
    
    // find the editor
    try {
      var editorInstance = Blaze.getView($(".command-editor").get(0)).templateInstance();
      
      editorInstance.editor.insert(result.code);
    } catch (e) {
      console.error("Failed to insert command in editor: " + e.message);
      RobaDialog.error("Failed to insert command in editor: " + e.message);
    }
  }
});

/**
 * Template Created
 */
Template.AdventureCommandHistory.onCreated(() => {
  let instance           = Template.instance();
  instance.historyLength = new ReactiveVar(10);
});