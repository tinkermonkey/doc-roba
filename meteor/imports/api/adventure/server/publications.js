import {Meteor} from 'meteor/meteor';
import {Adventures} from '../adventure.js';
import {AdventureCommands} from '../adventure_command.js';
import {AdventureStates} from '../adventure_state.js';
import {AdventureSteps} from '../adventure_step.js';
import {LogMessages} from '../../log_message/log_message.js';
import {TestAgents} from '../../test_agent/test_agent.js';
import {TestServers} from '../../test_server/test_server.js';
import {TestSystems} from '../../test_system/test_system.js';


Meteor.publish('adventure', function (adventureId) {
  return Adventures.find({_id: adventureId});
});

Meteor.publish('adventure_state', function (adventureId) {
  return AdventureStates.find({adventureId: adventureId});
});

Meteor.publish('adventure_test_system', function (testSystemId) {
  return TestSystems.find({staticId: testSystemId});
});

Meteor.publish('adventure_test_agent', function (testAgentId) {
  return TestAgents.find({staticId: testAgentId});
});

Meteor.publish('adventure_server', function (serverId) {
  return TestServers.find({staticId: serverId});
});

Meteor.publish('adventures', function () {
  return Adventures.find({});
});

Meteor.publish('adventure_log', function (adventureId, limit) {
  limit = limit || 100;
  var options = {sort: { timestamp: -1 }};
  if(limit > 0){
    options.limit = limit;
  }
  console.log('adventure_log:', adventureId, limit, options);
  return LogMessages.find({
    "context.adventureId": adventureId
  }, options);
});

Meteor.publish('adventure_actions', function (adventureId) {
  return AdventureSteps.find({adventureId: adventureId}, {sort: {order: 1}});
});

Meteor.publish('adventure_commands', function (adventureId) {
  return AdventureCommands.find({adventureId: adventureId}, {sort: {dateCreated: 1}});
});
