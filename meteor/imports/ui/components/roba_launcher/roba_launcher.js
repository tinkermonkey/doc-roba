import "./roba_launcher.html";
import "./roba_launcher.css";
import { Template } from "meteor/templating";
import { RobaDialog } from "meteor/austinsand:roba-dialog";
import { Adventures } from "../../../api/adventure/adventure.js";
import { AdventureStates } from "../../../api/adventure/adventure_state.js";
import { AdventureStatus } from "../../../api/adventure/adventure_status.js";
import { AdventureSteps } from "../../../api/adventure/adventure_step.js";
import { DatastoreRows } from "../../../api/datastore/datastore_row.js";
import { Servers } from "../../../api/test_server/server.js";
import { TestSystems } from "../../../api/test_system/test_system.js";

import '../editable_fields/editable_user_account.js';
import '../editable_fields/editable_server_selector.js';
import '../editable_fields/editable_test_system_selector.js';
import '../editable_fields/editable_test_agent_selector.js';
import '../routes/roba_launcher_route.js';

/**
 * Template Helpers
 */
Template.roba_launcher.helpers({
  getRoute () {
    return this.route.get();
  },
  getAccount () {
    var dataContext = this.dataContext.get();
    if (!dataContext.account && this.route) {
      let account = this.route.get().userType.getAccount();
      if (account) {
        dataContext.account = account._id;
        this.dataContext.set(dataContext);
      }
    }
    return this.dataContext.get().account;
  },
  getServer () {
    if (!this.server.get()) {
      var server = Servers.findOne({
        projectVersionId: this.projectVersionId,
        active          : true
      });
      if (server) {
        this.server.set(server.staticId);
      }
    }
    return this.server.get();
  },
  getTestSystem () {
    var testSystemId = this.testSystem.get();
    if (!testSystemId) {
      var testSystem = TestSystems.findOne({
        projectVersionId: this.projectVersionId,
        active          : true
      });
      if (testSystem) {
        //console.log("Test System selected: ", testSystem.staticId);
        this.testSystem.set(testSystem.staticId);
      }
    }
    return this.testSystem.get();
  },
  getTestAgent () {
    var testSystemId = this.testSystem.get(),
        testAgentId  = this.testAgent.get(),
        launchData   = this;
    if (!testAgentId && testSystemId) {
      var testSystem = TestSystems.findOne({
        projectVersionId: launchData.projectVersionId,
        staticId        : testSystemId
      });
      console.log("getTestAgent:", testSystem);
      if (testSystem && testSystem.testAgents && testSystem.testAgents.length) {
        console.log("Test Agent selected: ", testSystem.testAgents[ 0 ]);
        this.testAgent.set(testSystem.testAgents[ 0 ]);
      }
    }
    return this.testAgent.get();
  }
});

/**
 * Template Event Handlers
 */
Template.roba_launcher.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    var dataKey = $(e.target).attr("data-key");
    
    // if it's not a data variable, it goes in the data context
    if (instance.data[ dataKey ]) {
      console.log("Set: ", dataKey, newValue);
      instance.data[ dataKey ].set(newValue);
    } else {
      console.log("Set: ", "dataContext." + dataKey, newValue);
      var dataContext = instance.data.dataContext.get(),
          keys        = dataKey.split(".");
      if (keys.length == 2 && dataContext[ keys[ 0 ] ]) {
        dataContext[ keys[ 0 ] ][ keys[ 1 ] ] = newValue;
      } else {
        dataContext[ dataKey ] = newValue;
      }
      
      console.log("DataContext: ", dataContext);
      instance.data.dataContext.set(dataContext);
    }
  },
  "click .btn-launch-drone" (e, instance) {
    // get the server
    var adventureData = instance.data,
        server        = Servers.findOne({
          staticId: adventureData.server.get(),
          projectVersionId: adventureData.projectVersionId
        }),
        route         = adventureData.route.get();
    
    if (server) {
      // assemble the data context
      var dataContext = adventureData.dataContext.get();
      if (dataContext.account) {
        dataContext.account = DatastoreRows.findOne(dataContext.account);
      }
      
      // Create the adventure
      var adventureId = Adventures.insert({
        projectId       : adventureData.projectId,
        projectVersionId: adventureData.projectVersionId,
        testSystemId    : adventureData.testSystem.get(),
        testAgentId     : adventureData.testAgent.get(),
        serverId        : adventureData.server.get(),
        route           : route,
        dataContext     : dataContext,
        waitForCommands : true,
        status          : AdventureStatus.staged
      }, function (error) {
        if (error) {
          console.error("Failed to create adventure: " + error.message);
          RobaDialog.error("Failed to create adventure: " + error.message);
        } else {
          // Create the adventure step and link them into the route
          _.each(route.steps, function (step, stepIndex) {
            console.log("Creating route step: ", step, stepIndex);
            step.stepId = AdventureSteps.insert({
              projectId  : adventureData.projectId,
              adventureId: adventureId,
              actionId   : step.action ? step.action._id : null,
              nodeId     : step.node._id,
              order      : stepIndex
            }, function (error) {
              if (error) {
                console.error("Failed to update adventure route: " + error.message);
                RobaDialog.error("Failed to update adventure route: " + error.message);
              }
            });
          });
          
          // Update the adventure with the linked route steps
          Adventures.update(adventureId, { $set: { route: route } }, function (error) {
            if (error) {
              console.error("Failed to update adventure route: " + error.message);
              RobaDialog.error("Failed to update adventure route: " + error.message);
            } else {
              // Create the Adventure State record so the console functions properly
              AdventureStates.insert({
                adventureId: adventureId,
                projectId  : adventureData.projectId
              }, function (error) {
                if (error) {
                  console.error("Failed to create adventure state: " + error.message);
                  RobaDialog.error("Failed to create adventure state: " + error.message);
                } else {
                  // Launch the Adventure
                  Meteor.call("launchAdventure", adventureId, function (error) {
                    if (error) {
                      console.error("Failed to launch adventure " + adventureId + ": " + error.message);
                      RobaDialog.error("Failed to launch adventure " + adventureId + ": " + error.message);
                    } else {
                      // open the live console
                      window.open("/adventure_console/" + adventureData.projectId + "/" + adventureData.projectVersionId + "/" + adventureId, "_blank");
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.roba_launcher.created = function () {
  var instance      = Template.instance(),
      adventureData = instance.data;
  
  instance.autorun(function () {
    instance.subscribe("nodes", adventureData.projectId, adventureData.projectVersionId);
    instance.subscribe("actions", adventureData.projectId, adventureData.projectVersionId);
    instance.subscribe("servers", adventureData.projectId, adventureData.projectVersionId);
    instance.subscribe("version_datastore_rows", adventureData.projectId, adventureData.projectVersionId);
    instance.subscribe("test_systems", adventureData.projectId, adventureData.projectVersionId);
    instance.subscribe("test_agents", adventureData.projectId, adventureData.projectVersionId);
  });
};

/**
 * Template Rendered
 */
Template.roba_launcher.rendered = function () {
};

/**
 * Template Destroyed
 */
Template.roba_launcher.destroyed = function () {
  
};
