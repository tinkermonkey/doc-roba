import { Meteor } from 'meteor/meteor';
import { LogMessages } from '../log_message.js';

Meteor.methods({
  // add a log message for a helper
  addLogMessage: function (message) {
    if(message){
      LogMessages.insert(message);
    }
  }
});
