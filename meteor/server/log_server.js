Meteor.startup(function () {
  Meteor.methods({
    // add a log message for a helper
    addLogMessage: function (message) {
      Collections.LogMessages.insert(message);
    }
  })
});