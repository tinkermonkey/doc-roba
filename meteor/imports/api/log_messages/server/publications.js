import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {LogMessages} from '../log_messages.js';

Meteor.publish("test_result_log", function (projectId, testResultId) {
  console.debug("Publish: test_result_log:", projectId, testResultId);
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId)){
    return LogMessages.find({"context.testResultId": testResultId});
  }
  return [];
});
