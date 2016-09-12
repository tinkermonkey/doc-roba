import './adventure_console.html';
import './adventure_console.css';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Adventures } from '../../../../imports/api/adventure/adventure.js';
import { AdventureStatus } from '../../../../imports/api/adventure/adventure_status.js';
import { Nodes } from '../../../../imports/api/node/node.js';
import { NodeSearch } from '../../../../imports/api/node_search/node_search.js';
import { AdventureConsoleContext } from './adventure_console_context.js';
import './adventure_screen.js';
import './adventure_status_bar.js';
import './adventure_map.js';
import '../../components/routes/adventure_route.js';
import './context/adventure_context.js';
import './context/adventure_edit_node_actions.js';
import './adventure_command_editor.js';
import './adventure_command_history.js';

/**
 * Template Helpers
 */
Template.AdventureConsole.helpers({
  getContext () {
    return Template.instance().context;
  },
  getCurrentNode () {
    let context = Template.instance().context,
        nodeId = context.currentNodeId.get();
    if (nodeId) {
      return Nodes.findOne({ staticId: nodeId, projectVersionId: context.adventure.get().projectVersionId });
    }
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
    let adventure = instance.context.adventure.get();
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
  
  instance.context = new AdventureConsoleContext(instance)
      .setupSubscriptions()
      .loadData();
});

/**
 * Setup an adventure if one isn't active
 */
Template.AdventureConsole.onRendered(() => {
  let instance = Template.instance();
  
  // perform an initial check
  //NodeSearch.checkAdventureLocation(instance.context);
});
