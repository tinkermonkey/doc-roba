/**
 * Template Helpers
 */
Template.AdventureConsole.helpers({
  getTestSystem: function () {
    return TestSystems.findOne({staticId: this.adventure.testSystemId, projectVersionId: this.adventure.projectVersionId});
  },
  getFullContext: function () {
    var instance = Template.instance();
    this.currentNode = instance.currentNode;
    this.showSearch  = instance.showSearch;
    return this;
  },
  showSearch: function () {
    return this.showSearch.get();
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureConsole.events({
  "click .btn-unpause-adventure": function (e, instance) {
    Adventures.update(instance.data.adventure._id, {$set: {status: instance.prePauseStatus || AdventureStatus.awaitingCommand}}, function (error, result) {
      if(error){
        Meteor.log.error("Un-Pause failed: " + error.message);
        Dialog.error("Un-Pause failed: " + error.message);
      }
    });
  },
  "click .btn-pause-adventure": function (e, instance) {
    instance.prePauseStatus = instance.data.adventure.status;
    Adventures.update(instance.data.adventure._id, {$set: {status: AdventureStatus.paused}}, function (error, result) {
      if(error){
        Meteor.log.error("Pause failed: " + error.message);
        Dialog.error("Pause failed: " + error.message);
      }
    });
  },
  "click .btn-end-adventure": function (e, instance) {
    Meteor.call("abortAdventure", instance.data.adventure._id, function (error, result) {
      if(error){
        Meteor.log.error("End Adventure failed: " + error.message);
        Dialog.error("End Adventure failed: " + error.message);
      }
    });
  },
  "click .btn-view-log": function (e, instance) {
    window.open("/adventure_log/" + instance.data.adventure._id, "_blank");
  }
});

/**
 * Template created
 */
Template.AdventureConsole.created = function () {
  var instance = Template.instance();
  instance.currentNode = new ReactiveVar();
  instance.showSearch  = new ReactiveVar(false);
};

/**
 * Setup an adventure if one isn't active
 */
Template.AdventureConsole.rendered = function () {
  var instance = Template.instance();

  // initialize the tabs
  Tabs.init(instance);

  // pick up any updates to the last known node
  Adventures.find({_id: instance.data.adventure._id}).observeChanges({
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
  //console.log("Observing changes for adventure state: ", instance.data.state._id);
  AdventureStates.find({_id: instance.data.state._id}).observeChanges({
    changed: function (id, fields) {
      //console.log("Adventure State changed: ", _.keys(fields));
      if(_.contains(_.keys(fields), "url")){
        console.log("AdventureConsole: checking current location against updated url ", fields.url);
        setTimeout(function () {
          NodeSearch.checkAdventureLocation(instance);
        }, 100);
      }
    }
  });

  // perform an initial check
  NodeSearch.checkAdventureLocation(instance);
};
