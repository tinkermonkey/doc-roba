import { Meteor } from 'meteor/meteor';
import { LogMessages } from '../log_messages.js';

Meteor.methods({
  // add a log message for a helper
  addLogMessage(message) {
    if(message){
      LogMessages.insert(message);
    }
  }
});
