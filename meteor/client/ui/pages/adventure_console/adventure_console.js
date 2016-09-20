import './adventure_console.html';
import './adventure_console.css';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Adventures } from '../../../../imports/api/adventure/adventure.js';
import { AdventureStatus } from '../../../../imports/api/adventure/adventure_status.js';
import { Nodes } from '../../../../imports/api/node/node.js';
import { AdventureContext } from './adventure_context.js';
import './adventure_header.js';
import './adventure_map.js';
import './adventure_screen.js';
import './adventure_status_bar.js';
import './adventure_command_editor.js';
import './adventure_command_history.js';
import '../../components/routes/adventure_route.js';
import './current_location/current_location.js';
import './current_location/current_location_menu.js';
import './current_location/current_location_actions.js';

/**
 * Template Helpers
 */
Template.AdventureConsole.helpers({
  getContext () {
    return Template.instance().context;
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureConsole.events({
  "click .btn-unpause-adventure" (e, instance) {
    let adventure = instance.context.adventure.get();
    Adventures.update(adventure._id, { $set: { status: instance.prePauseStatus || AdventureStatus.awaitingCommand } }, function (error, result) {
      if (error) {
        RobaDialog.error("Un-Pause failed: " + error.message);
      }
    });
  },
  "click .btn-pause-adventure" (e, instance) {
    let adventure           = instance.context.adventure.get();
    instance.prePauseStatus = adventure.status;
    Adventures.update(adventure._id, { $set: { status: AdventureStatus.paused } }, function (error, result) {
      if (error) {
        RobaDialog.error("Pause failed: " + error.message);
      }
    });
  },
  "click .btn-end-adventure" (e, instance) {
    let adventure = instance.context.adventure.get();
    Meteor.call("abortAdventure", adventure._id, function (error, result) {
      if (error) {
        RobaDialog.error("End Adventure failed: " + error.message);
      }
    });
  },
  "click .btn-view-log" (e, instance) {
    window.open("/adventure_log/" + FlowRouter.getParam("projectId") + "/" + FlowRouter.getParam("projectVersionId") + "/" + FlowRouter.getParam("adventureId"), "_blank");
  }
});

/**
 * Template created
 */
Template.AdventureConsole.onCreated(() => {
  let instance = Template.instance();
  
  instance.context = new AdventureContext(instance)
      .setupSubscriptions()
      .loadData();
});

/**
 * Setup an adventure if one isn't active
 */
Template.AdventureConsole.onRendered(() => {

});
