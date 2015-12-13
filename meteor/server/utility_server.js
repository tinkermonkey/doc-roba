/**
 * Misc general server methods
 */
Meteor.startup(function () {
  Meteor.methods({
    // Update a documentation method from webdriver.io
    updateDriverCommand: function (docs) {
      if (docs) {
        _.each(docs, function (doc) {
          // check to see if the doc exists
          var exists = Collections.DriverCommands.find({name: doc.name}).count();
          if (exists) {
            Collections.DriverCommands.update({name: doc.name}, {$set: doc});
          } else {
            Collections.DriverCommands.insert(doc);
          }
        });
      }
    }
  });
});
