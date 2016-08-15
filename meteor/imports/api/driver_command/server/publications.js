import {Meteor} from 'meteor/meteor';
import {DriverCommands} from '../driver_command.js';

Meteor.publish("driver_commands", function () {
  console.debug("Publish: driver_commands");
  return DriverCommands.find();
});
