import './adventure_command_history.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureCommands } from '../../../../imports/api/adventure/adventure_command.js';
import { AdventureStepStatus } from '../../../../imports/api/adventure/adventure_step_status.js';
import '../../lib/pretty_code/pretty_code.js';
import '../../components/log_messages/log_message_data.js';

/**
 * Helpers
 */
Template.AdventureCommandHistory.helpers({
  getCommands () {
    let adventure = this.adventure.get(),
        limit = Template.instance().historyLength.get();
    if (adventure._id) {
      return AdventureCommands.find({ adventureId: adventure._id }, { sort: { dateCreated: -1 }, limit: limit });
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
    instance.editor.insert(result.code);
  }
});

/**
 * Template Created
 */
Template.AdventureCommandHistory.onCreated(() => {
  let instance           = Template.instance();
  instance.historyLength = new ReactiveVar(10);
  
  try {
    let editorInstance = Blaze.getView($(".command-editor").get(0)).templateInstance();
    instance.editor = editorInstance.editor;
  } catch (e) {
    console.error("Failed to identify command editor: " + e.message);
  }
});