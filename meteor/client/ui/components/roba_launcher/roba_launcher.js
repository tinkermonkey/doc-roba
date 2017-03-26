import './roba_launcher.html';
import './roba_launcher.css';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Adventures } from '../../../../imports/api/adventures/adventures.js';
import { AdventureStates } from '../../../../imports/api/adventures/adventure_states.js';
import { AdventureStatus } from '../../../../imports/api/adventures/adventure_status.js';
import { AdventureSteps } from '../../../../imports/api/adventures/adventure_steps.js';
import { DatastoreRows } from '../../../../imports/api/datastores/datastore_rows.js';
import { PlatformViewports } from '../../../../imports/api/platform_configurations/platform_viewports.js';
import { TestServers } from '../../../../imports/api/test_servers/test_servers.js';
import { TestSystems } from '../../../../imports/api/test_systems/test_systems.js';
import '../editable_fields/editable_record_selector.js';
import '../editable_fields/editable_user_account.js';
import '../editable_fields/editable_server_selector.js';
import '../editable_fields/editable_test_system_selector.js';
import '../editable_fields/editable_test_agent_selector.js';
import '../routes/roba_launcher_route.js';

/**
 * Template Helpers
 */
Template.roba_launcher.helpers({
  /**
   * Get the selected account or select a default account
   * @return {*} DatastoreRow
   */
  getAccount () {
    let robaContext = this,
        dataContext = robaContext.dataContext.get();
    if (!dataContext.account && robaContext.route) {
      let account = robaContext.route.get().userType.getAccount();
      if (account) {
        dataContext.account = account._id;
        robaContext.dataContext.set(dataContext);
      }
    }
    return dataContext.account;
  },
  
  /**
   * Get the selected test server
   * @return String TestServer.staticId
   */
  getServer () {
    let robaContext = this,
        serverId    = robaContext.server.get();
    if (!serverId) {
      let server = TestServers.findOne({
        projectVersionId: robaContext.projectVersionId,
        active          : true
      });
      if (server) {
        serverId = server.staticId;
        robaContext.server.set(serverId);
      }
    }
    return serverId;
  },
  
  /**
   * Get the selected test system
   * @return String TestSystem.staticId
   */
  getTestSystem () {
    let robaContext  = this,
        testSystemId = robaContext.testSystem.get();
    if (!testSystemId) {
      let testSystem = TestSystems.findOne({
        projectVersionId: robaContext.projectVersionId,
        active          : true
      });
      if (testSystem) {
        //console.log("Test System selected: ", testSystem.staticId);
        testSystemId = testSystem.staticId;
        robaContext.testSystem.set(testSystemId);
      }
    }
    return testSystemId;
  },
  
  /**
   * Get the selected test agent
   * @return String TestAgent.staticId
   */
  getTestAgent () {
    let robaContext  = this,
        testSystemId = robaContext.testSystem.get(),
        testAgentId  = robaContext.testAgent.get();
    if (!testAgentId && testSystemId) {
      let testSystem = TestSystems.findOne({
        projectVersionId: robaContext.projectVersionId,
        staticId        : testSystemId
      });
      if (testSystem && testSystem.testAgents && testSystem.testAgents.length) {
        console.log("Test Agent selected: ", testSystem.testAgents[ 0 ]);
        testAgentId = testSystem.testAgents[ 0 ];
        robaContext.testAgent.set(testAgentId);
      }
    }
    return testAgentId;
  },
  
  /**
   * Get the context for the Viewport selector
   *
   */
  viewportSelectorContext () {
    let robaContext    = this,
        dataContext    = robaContext.dataContext.get(),
        robaRoute      = robaContext.route.get(),
        platformConfig = robaRoute.destination.platformConfig();
    if (!dataContext.viewport && robaContext.route) {
      let viewport = platformConfig.defaultViewport();
      if (viewport) {
        console.log("Viewport selected:", viewport);
        dataContext.viewport = viewport._id;
        robaContext.dataContext.set(dataContext);
      }
    }
    
    return {
      valueField: "_id",
      value     : dataContext.viewport,
      dataKey   : "viewport",
      collection: PlatformViewports,
      query     : {
        platformId: platformConfig._id
      }
    };
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
  "click .btn-launch" (e, instance) {
    // get the server
    var adventureData = instance.data,
        server        = TestServers.findOne({
          staticId        : adventureData.server.get(),
          projectVersionId: adventureData.projectVersionId
        }),
        route         = adventureData.route.get();
    
    if (server) {
      // assemble the data context by pulling in the full records in place of the ids
      var dataContext = adventureData.dataContext.get();
      if (dataContext.account) {
        dataContext.account = DatastoreRows.findOne(dataContext.account);
      }
      if (dataContext.viewport) {
        dataContext.viewport = PlatformViewports.findOne(dataContext.viewport);
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
                  Meteor.call("launchAdventure", adventureData.projectId, adventureId, function (error) {
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
    instance.subscribe("test_servers", adventureData.projectId, adventureData.projectVersionId);
    instance.subscribe("version_datastore_rows", adventureData.projectId, adventureData.projectVersionId);
    instance.subscribe("test_systems", adventureData.projectId, adventureData.projectVersionId);
    instance.subscribe("test_agents", adventureData.projectId, adventureData.projectVersionId);
    instance.subscribe("platform_viewports", adventureData.projectId, adventureData.projectVersionId);
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
