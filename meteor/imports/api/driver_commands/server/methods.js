import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import {DriverCommands} from '../driver_commands.js';

Meteor.methods({
  // Update a documentation method from webdriver.io
  updateDriverCommand(docs) {
    check(docs, [Object]);
    _.each(docs, function (doc) {
      // check to see if the doc exists
      var exists = DriverCommands.find({name: doc.name}).count();
      if (exists) {
        DriverCommands.update({name: doc.name}, {$set: doc});
      } else {
        DriverCommands.insert(doc);
      }
    });
  },
});
