/**
 * Template Helpers
 */
Template.roba_launcher.helpers({
  getRoute: function () {
    return this.route.get();
  },
  getAccount: function () {
    var dataContext = this.dataContext.get();
    if(!dataContext.account && this.route){
      var userTypeId = this.route.get().userType._id,
        dataStore = DataStores.findOne({ dataKey: userTypeId }),
        account = DataStoreRows.findOne({dataStoreId: dataStore._id}, {sort: {dateCreated: 1}});
      if(account){
        dataContext.account = account._id;
        this.dataContext.set(dataContext);
      }
    }
    return this.dataContext.get().account;
  },
  getServer: function () {
    if(!this.server.get()){
      var server = Servers.findOne({
        projectVersionId: this.projectVersionId,
        active: true
      });
      if(server){
        this.server.set(server.staticId);
      }
    }
    return this.server.get();
  },
  getTestSystem: function () {
    var testSystemId = this.testSystem.get();
    if(!testSystemId){
      var testSystem = TestSystems.findOne({
        projectVersionId: this.projectVersionId,
        active: true
      });
      if(testSystem){
        //console.log("Test System selected: ", testSystem.staticId);
        this.testSystem.set(testSystem.staticId);
      }
    }
    return this.testSystem.get();
  },
  getTestAgent: function () {
    var testSystemId = this.testSystem.get(),
        testAgentId = this.testAgent.get(),
        launchData = this;
    if(!testAgentId && testSystemId){
      var testSystem = TestSystems.findOne({
        projectVersionId: launchData.projectVersionId,
        staticId: testSystemId
      });
      console.log("getTestAgent:", testSystem);
      if(testSystem && testSystem.testAgents && testSystem.testAgents.length){
        console.log("Test Agent selected: ", testSystem.testAgents[0]);
        this.testAgent.set(testSystem.testAgents[0]);
      }
    }
    return this.testAgent.get();
  }
});

/**
 * Template Event Handlers
 */
Template.roba_launcher.events({
  "edited .editable": function (e, instance, newValue) {
    e.stopImmediatePropagation();
    var dataKey = $(e.target).attr("data-key");

    // if it's not a data variable, it goes in the data context
    if(instance.data[dataKey]){
      console.log("Set: ", dataKey, newValue);
      instance.data[dataKey].set(newValue);
    } else {
      console.log("Set: ", "dataContext." + dataKey, newValue);
      var dataContext = instance.data.dataContext.get(),
        keys = dataKey.split(".");
      if(keys.length == 2 && dataContext[keys[0]]){
        dataContext[keys[0]][keys[1]] = newValue;
      } else {
        dataContext[dataKey] = newValue;
      }

      console.log("DataContext: ", dataContext);
      instance.data.dataContext.set(dataContext);
    }
  },
  "click .btn-launch-drone": function (e, instance) {
    // get the server
    var adventureData = instance.data,
        server = Servers.findOne({staticId: adventureData.server.get(), projectVersionId: adventureData.projectVersionId}),
      route = adventureData.route.get();

    if(server){
      // assemble the data context
      var dataContext = adventureData.dataContext.get();
      if(dataContext.account){
        dataContext.account = DataStoreRows.findOne(dataContext.account);
      }

      // Create the adventure
      var adventureId = Adventures.insert({
        projectId: adventureData.projectId,
        projectVersionId: adventureData.projectVersionId,
        testSystemId: adventureData.testSystem.get(),
        testAgentId: adventureData.testAgent.get(),
        serverId: adventureData.server.get(),
        route: route,
        dataContext: dataContext,
        waitForCommands: true,
        status: AdventureStatus.staged
      }, function (error) {
        if(error){
          console.error("Failed to create adventure: " + error.message);
          Dialog.error("Failed to create adventure: " + error.message);
        } else {
          // Create the adventure step and link them into the route
          _.each(route.steps, function (step, stepIndex) {
            console.log("Creating route step: ", step, stepIndex);
            step.stepId = AdventureSteps.insert({
              projectId: adventureData.projectId,
              adventureId: adventureId,
              actionId: step.action ? step.action._id : null,
              nodeId: step.node._id,
              order: stepIndex
            }, function (error) {
              if(error){
                console.error("Failed to update adventure route: " + error.message);
                Dialog.error("Failed to update adventure route: " + error.message);
              }
            });
          });

          // Update the adventure with the linked route steps
          Adventures.update(adventureId, {$set: {route: route}}, function (error) {
            if(error){
              console.error("Failed to update adventure route: " + error.message);
              Dialog.error("Failed to update adventure route: " + error.message);
            } else {
              // Create the Adventure State record so the console functions properly
              AdventureStates.insert({adventureId: adventureId, projectId: adventureData.projectId}, function (error) {
                if(error){
                  console.error("Failed to create adventure state: " + error.message);
                  Dialog.error("Failed to create adventure state: " + error.message);
                } else {
                  // Launch the Adventure
                  Meteor.call("launchAdventure", adventureId, function (error) {
                    if(error){
                      console.error("Failed to launch adventure " + adventureId + ": " + error.message);
                      Dialog.error("Failed to launch adventure " + adventureId + ": " + error.message);
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
  var instance = Template.instance(),
      adventureData = instance.data;

  instance.autorun(function () {
    instance.subscribe("nodes", adventureData.projectId, adventureData.projectVersionId);
    instance.subscribe("actions", adventureData.projectId, adventureData.projectVersionId);
    instance.subscribe("servers", adventureData.projectId, adventureData.projectVersionId);
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

/**
 * Helper to assist in the creation of the correct context
 */
RobaContext = function (config) {
  check(config.route, RobaRoute);

  var route = config.route.export();

  console.log("RobaContext Route: ", route);

  // Initialize the data context
  var defaultDataContext = {};
  _.each(route.steps, function (step) {
    defaultDataContext["step" + step.stepNum] = {};
  });

  this.projectId        = route.projectId;
  this.projectVersionId = route.projectVersionId;
  this.route            = new ReactiveVar(route);
  this.dataContext      = new ReactiveVar(config.dataContext || defaultDataContext);
  this.server           = new ReactiveVar(config.server);
  this.testAgent        = new ReactiveVar(config.testAgent);
  this.testSystem       = new ReactiveVar(config.testSystem);
};