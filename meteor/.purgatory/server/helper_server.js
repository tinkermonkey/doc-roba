/**
 * Server Startup
 */
Meteor.startup(function() {
  // remote helper methods
  Meteor.methods({
    // Update the status of a helper
    setTestSystemStatus: function (testSystemId, status) {
      console.log("setTestSystemStatus: ", testSystemId, status);
      if (testSystemId) {
        var testSystem = Collections.TestSystems.findOne({_id: testSystemId});
        if (testSystem) {
          Collections.TestSystems.update({_id: testSystem._id}, {$set: {status: status}});
        }
      }
    },
    // Get the status of a test system
    getTestSystemStatus: function (testSystemId) {
      if (testSystemId) {
        var testSystem = Collections.TestSystems.findOne({_id: testSystemId});
        if (testSystem) {
          return testSystem.status;
        }
      }
    },
    // Set the current log file name of a test system
    setTestSystemLogFile: function (testSystemId, path) {
      if (testSystemId) {
        Collections.TestSystems.update({_id: testSystemId}, {$set: {logFile: path}});
      }
    },
    // Retrieve the record for a test system
    loadTestSystemRecord: function (testSystemId) {
      console.log("loadTestSystemRecord: ", testSystemId);
      if (testSystemId) {
        return Collections.TestSystems.findOne({_id: testSystemId});
      }
    },
    // Get the next adventure for a test system
    getNextAdventure: function (testSystemId) {
      if (testSystemId) {
        var adventure = Collections.Adventures.find({testSystemId: testSystemId, status: /ready/i}, {sort:{timeCreated: -1}, limit: 1}).fetch();
        if (adventure.length) {
          adventure = adventure[0];
          //console.log("getNextAdventure: ", adventure);
          // build up the data structure we hand back
          adventure.actions = ActionResults.find({adventureId: adventure._id}, {sort: {order: 1}}).fetch();
          _.each(adventure.actions, function(action, i){
            // get the commands
            action.commands = CommandResults.find({actionResultId: action._id}, {sort: {order: 1}}).fetch();

            // get the validations
            action.validations = ValidationResults.find({actionResultId: action._id}, {sort: {order: 1}}).fetch();
          });
          //console.log("getNextAdventure: ", adventure);
          return adventure;
        }
      }
    },
    // Get the next adventure id for a test system
    getNextAdventureId: function (testSystemId) {
      if (testSystemId) {
        var adventures = Collections.Adventures.find({testSystemId: testSystemId, status: /ready/i}, {sort:{timeCreated: -1}, limit: 1}).fetch();
        if (adventures.length) {
          var adventure = adventures[0];
          return adventure._id;
        }
      }
    }
  });
});
