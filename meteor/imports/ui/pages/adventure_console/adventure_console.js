import './adventure_console.html';
import './adventure_console.css';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Adventures } from '../../../api/adventure/adventure.js';
import { AdventureStatus } from '../../../api/adventure/adventure_status.js';
import { AdventureStates } from '../../../api/adventure/adventure_state.js';
import { Nodes } from '../../../api/node/node.js';
import { NodeSearch } from '../../../api/node_search/node_search.js';
import { TestSystems } from '../../../api/test_system/test_system.js';
import './adventure_screen.js';
import './adventure_status_bar.js';
import './adventure_map.js';
import '../../components/routes/adventure_route.js';
import './adventure_context.js';
import './adventure_edit_node_actions.js';
import './adventure_command_editor.js';
import './adventure_command_history.js';

/**
 * Template Helpers
 */
Template.AdventureConsole.helpers({
  adventure () {
    return Template.instance().adventure.get();
  },
  state () {
    return Template.instance().state.get();
  },
  getTestSystem () {
    return Template.instance().testSystem.get();
  },
  getFullContext () {
    let instance  = Template.instance(),
        adventure = instance.adventure.get(),
        state     = instance.state.get();
    
    if (adventure && state) {
      return {
        currentNodeId: instance.currentNodeId, // downstream read/write access needed
        adventure    : adventure,
        state        : state
      };
    }
  },
  getCurrentNode () {
    let nodeId = Template.instance().currentNodeId.get();
    if (nodeId) {
      return Nodes.findOne({ staticId: nodeId, projectVersionId: this.adventure.projectVersionId });
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureConsole.events({
  "click .btn-unpause-adventure" (e, instance) {
    Adventures.update(FlowRouter.getParam("adventureId"), { $set: { status: instance.prePauseStatus || AdventureStatus.awaitingCommand } }, function (error, result) {
      if (error) {
        RobaDialog.error("Un-Pause failed: " + error.message);
      }
    });
  },
  "click .btn-pause-adventure" (e, instance) {
    instance.prePauseStatus = instance.data.adventure.status;
    Adventures.update(FlowRouter.getParam("adventureId"), { $set: { status: AdventureStatus.paused } }, function (error, result) {
      if (error) {
        RobaDialog.error("Pause failed: " + error.message);
      }
    });
  },
  "click .btn-end-adventure" (e, instance) {
    Meteor.call("abortAdventure", FlowRouter.getParam("adventureId"), function (error, result) {
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
  var instance           = Template.instance();
  instance.currentNodeId = new ReactiveVar();
  instance.adventure     = new ReactiveVar();
  instance.state         = new ReactiveVar();
  instance.testSystem    = new ReactiveVar();
  
  instance.autorun(function () {
    var projectId        = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId"),
        adventureId      = FlowRouter.getParam("adventureId");
    
    instance.subscribe("adventure", adventureId);
    instance.subscribe("adventure_state", adventureId);
    instance.subscribe("adventure_actions", adventureId);
    instance.subscribe("adventure_commands", adventureId);
    instance.subscribe("nodes", projectId, projectVersionId);
    instance.subscribe("actions", projectId, projectVersionId);
    instance.subscribe("servers", projectId, projectVersionId);
    instance.subscribe("test_systems", projectId, projectVersionId);
    instance.subscribe("test_agents", projectId, projectVersionId);
  });
  
  instance.autorun( () => {
    let adventureId = FlowRouter.getParam("adventureId");
    
    if (instance.subscriptionsReady()) {
      let adventure = Adventures.findOne(adventureId),
          state     = AdventureStates.findOne({ adventureId: adventureId });
      
      instance.adventure.set(adventure);
      instance.state.set(state);
      instance.testSystem.set(TestSystems.findOne({
        staticId        : adventure.testSystemId,
        projectVersionId: adventure.projectVersionId
      }));
      
      // pick up any updates to the last known node
      Adventures.find({ _id: adventureId }).observeChanges({
        changed (id, fields) {
          //console.log("Adventure changed: ", fields);
          if (_.contains(_.keys(fields), "lastKnownNode")) {
            //console.log("AdventureConsole: checking current location against updated lastKnownNode ", fields.lastKnownNode);
            setTimeout(function () {
              NodeSearch.checkAdventureLocation(instance);
            }, 100);
          }
        }
      });
      
      // React to changes in the url
      AdventureStates.find({ _id: state._id }).observeChanges({
        changed (id, fields) {
          //console.log("Adventure State changed: ", _.keys(fields));
          if (_.contains(_.keys(fields), "url") || _.contains(_.keys(fields), "title")) {
            //console.log("AdventureConsole: checking current location", fields);
            setTimeout(function () {
              NodeSearch.checkAdventureLocation(instance);
            }, 100);
          }
        }
      });
    }
  });
});

/**
 * Setup an adventure if one isn't active
 */
Template.AdventureConsole.onRendered(() => {
  let instance = Template.instance();
  
  // respond to location changes
  instance.autorun(() => {
    var currentLocation = instance.currentNodeId.get();
    if (instance.previousLocation && currentLocation && instance.previousLocation !== currentLocation) {
      console.log("Current node changed, clearing highlights:", currentLocation, instance.previousLocation);
      instance.$(".btn-clear-highlight").trigger("click");
      instance.previousLocation = currentLocation;
    } else if (!instance.previousLocation) {
      instance.previousLocation = currentLocation;
    }
  });
  
  // perform an initial check
  NodeSearch.checkAdventureLocation(instance);
});
