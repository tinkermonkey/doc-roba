/**
 * Template Helpers
 */
Template.AdventureConsole.helpers({
  adventure: function () {
    return Template.instance().adventure.get();
  },
  state: function () {
    return Template.instance().state.get();
  },
  getTestSystem: function () {
    return Template.instance().testSystem.get();
  },
  getFullContext: function () {
    var instance = Template.instance(),
        adventure = instance.adventure.get(),
        state = instance.state.get();

    if(adventure && state){
      return {
        currentNodeId: instance.currentNodeId, // downstream read/write access needed
        adventure: adventure,
        state: state
      };
    }
  },
  getCurrentNode: function () {
    var nodeId = Template.instance().currentNodeId.get();
    if(nodeId){
      return Collections.Nodes.findOne({ staticId: nodeId, projectVersionId: this.adventure.projectVersionId });
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureConsole.events({
  "click .btn-unpause-adventure": function (e, instance) {
    Collections.Adventures.update(Router.current().params.adventureId, {$set: {status: instance.prePauseStatus || AdventureStatus.awaitingCommand}}, function (error, result) {
      if(error){
        Meteor.log.error("Un-Pause failed: " + error.message);
        Dialog.error("Un-Pause failed: " + error.message);
      }
    });
  },
  "click .btn-pause-adventure": function (e, instance) {
    instance.prePauseStatus = instance.data.adventure.status;
    Collections.Adventures.update(Router.current().params.adventureId, {$set: {status: AdventureStatus.paused}}, function (error, result) {
      if(error){
        Meteor.log.error("Pause failed: " + error.message);
        Dialog.error("Pause failed: " + error.message);
      }
    });
  },
  "click .btn-end-adventure": function (e, instance) {
    Meteor.call("abortAdventure", Router.current().params.adventureId, function (error, result) {
      if(error){
        Meteor.log.error("End Adventure failed: " + error.message);
        Dialog.error("End Adventure failed: " + error.message);
      }
    });
  },
  "click .btn-view-log": function (e, instance) {
    window.open("/adventure_log/" + Router.current().params.projectId + "/" + Router.current().params.projectVersionId + "/" + Router.current().params.adventureId, "_blank");
  }
});

/**
 * Template created
 */
Template.AdventureConsole.created = function () {
  var instance = Template.instance();
  instance.currentNodeId = new ReactiveVar();
  instance.adventure = new ReactiveVar();
  instance.state = new ReactiveVar();
  instance.testSystem = new ReactiveVar();

  instance.autorun(function () {
    var route = Router.current();
    console.log("AdventureConsole.created:", route.params.projectId, route.params.projectVersionId, route.params.adventureId);
    instance.subscribe("adventure", route.params.adventureId);
    instance.subscribe("adventure_state", route.params.adventureId);
    instance.subscribe("adventure_actions", route.params.adventureId);
    instance.subscribe("adventure_commands", route.params.adventureId);
    instance.subscribe("nodes", route.params.projectId, route.params.projectVersionId);
    instance.subscribe("actions", route.params.projectId, route.params.projectVersionId);
    instance.subscribe("servers", route.params.projectId, route.params.projectVersionId);
    instance.subscribe("test_systems", route.params.projectId, route.params.projectVersionId);
    instance.subscribe("test_agents", route.params.projectId, route.params.projectVersionId);
  });

  instance.autorun(function () {
    var route = Router.current(),
        ready = instance.subscriptionsReady();
    console.log("autorun: ", ready);
    if(ready){
      var adventure = Collections.Adventures.findOne(route.params.adventureId),
          state = Collections.AdventureStates.findOne({adventureId: route.params.adventureId});

      instance.adventure.set(adventure);
      instance.state.set(state);
      instance.testSystem.set(Collections.TestSystems.findOne({ staticId: adventure.testSystemId, projectVersionId: route.params.adventureId }));

      // pick up any updates to the last known node
      Collections.Adventures.find({_id: Router.current().params.adventureId}).observeChanges({
        changed: function (id, fields) {
          //console.log("Adventure changed: ", fields);
          if(_.contains(_.keys(fields), "lastKnownNode")){
            //console.log("AdventureConsole: checking current location against updated lastKnownNode ", fields.lastKnownNode);
            setTimeout(function () {
              NodeSearch.checkAdventureLocation(instance);
            }, 100);
          }
        }
      });

      // React to changes in the url
      Collections.AdventureStates.find({_id: state._id}).observeChanges({
        changed: function (id, fields) {
          //console.log("Adventure State changed: ", _.keys(fields));
          if(_.contains(_.keys(fields), "url") || _.contains(_.keys(fields), "title")){
            //console.log("AdventureConsole: checking current location", fields);
            setTimeout(function () {
              NodeSearch.checkAdventureLocation(instance);
            }, 100);
          }
        }
      });
    };
  });
};

/**
 * Setup an adventure if one isn't active
 */
Template.AdventureConsole.rendered = function () {
  var instance = Template.instance();

  // respond to location changes
  instance.autorun(function () {
    var currentLocation = instance.currentNodeId.get();
    if(instance.previousLocation && currentLocation && instance.previousLocation !== currentLocation){
      console.log("Current node changed, clearing highlights:", currentLocation, instance.previousLocation);
      instance.$(".btn-clear-highlight").trigger("click");
      instance.previousLocation = currentLocation;
    } else if(!instance.previousLocation) {
      instance.previousLocation = currentLocation;
    }
  });

  // initialize the tabs
  instance.autorun(function () {
    var ready = instance.subscriptionsReady();
    if(ready){
      Accordion.init(instance);
    }
  });

  // perform an initial check
  NodeSearch.checkAdventureLocation(instance);
};
