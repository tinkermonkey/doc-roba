import { Meteor } from 'meteor/meteor';
import { Auth } from '../../auth.js';
import { Adventures } from '../adventures.js';
import { AdventureCommands } from '../adventure_commands.js';
import { AdventureStates } from '../adventure_states.js';
import { AdventureSteps } from '../adventure_steps.js';
import { LogMessages } from '../../log_messages/log_messages.js';
import { TestAgents } from '../../test_agents/test_agents.js';
import { TestServers } from '../../test_server/test_server.js';
import { TestSystems } from '../../test_system/test_system.js';

Meteor.publish('adventure', function (adventureId) {
  console.debug("Publish: adventure", adventureId);
  // Automation only has the adventureId, so use that to look up the project and check permissions
  let adventure = Adventures.findOne({ _id: adventureId });
  if (adventure && Auth.hasProjectAccess(this.userId, adventure.projectId)) {
    return Adventures.find({ _id: adventureId });
  }
  console.warn("Publish: adventure returning nothing for [" + adventureId + "], " + this.userId);
  return [];
});

Meteor.publish('adventure_steps', function (projectId, adventureId) {
  console.debug("Publish: adventure_steps", projectId, adventureId);
  // check that there is a project role for the current user
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return AdventureSteps.find({ projectId: projectId, adventureId: adventureId }, { sort: { order: 1 } });
  }
  console.warn("Publish: adventure_steps returning nothing for [" + projectId + "], [" + adventureId + "], " + this.userId);
  return [];
});

Meteor.publish('adventure_state', function (projectId, adventureId) {
  console.debug("Publish: adventure_state", projectId, adventureId);
  // check that there is a project role for the current user
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return AdventureStates.find({ projectId: projectId, adventureId: adventureId });
  }
  console.warn("Publish: adventure_state returning nothing for [" + projectId + "], [" + adventureId + "], " + this.userId);
  return [];
});

Meteor.publish('adventure_test_system', function (projectId, testSystemId) {
  console.debug("Publish: adventure_test_system", projectId, testSystemId);
  // check that there is a project role for the current user
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return TestSystems.find({ projectId: projectId, staticId: testSystemId });
  }
  console.warn("Publish: adventure_test_system returning nothing for [" + projectId + "], [" + testSystemId + "], " + this.userId);
  return [];
});

Meteor.publish('adventure_test_agent', function (projectId, testAgentId) {
  console.debug("Publish: adventure_test_agent", projectId, testAgentId);
  // check that there is a project role for the current user
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return TestAgents.find({ projectId: projectId, staticId: testAgentId });
  }
  console.warn("Publish: adventure_test_agent returning nothing for [" + projectId + "], [" + testAgentId + "], " + this.userId);
  return [];
});

Meteor.publish('adventure_server', function (projectId, serverId) {
  console.debug("Publish: adventure_server", projectId, serverId);
  // check that there is a project role for the current user
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return TestServers.find({ projectId: projectId, staticId: serverId });
  }
  console.warn("Publish: adventure_server returning nothing for [" + projectId + "], [" + serverId + "], " + this.userId);
  return [];
});

Meteor.publish('adventures', function () {
  if(this.userId){
    return Adventures.find({createdBy: this.userId});
  }
  console.warn("Publish: adventures returning nothing");
  return [];
});

Meteor.publish('adventure_log', function (projectId, adventureId, limit) {
  console.debug("Publish: adventure_log", projectId, adventureId, limit);

  // In order to keep the query simple, we'll pull the Adventure and verify that the projectId matches
  var adventure = Adventures.findOne({_id: adventureId});
  
  // check that there is a project role for the current user
  if (adventure && adventure.projectId == projectId && Auth.hasProjectAccess(this.userId, adventure.projectId)) {
    limit       = limit || 100;
    var options = { sort: { timestamp: -1 } };
    if (limit > 0) {
      options.limit = limit;
    }
    return LogMessages.find({
      "context.adventureId": adventureId
    }, options);
  }
  console.warn("Publish: adventure_log returning nothing for [" + projectId + "], [" + adventureId + "], " + this.userId);
  return [];
});

Meteor.publish('adventure_commands', function (projectId, adventureId) {
  console.debug("Publish: adventure_commands", projectId, adventureId);
  // check that there is a project role for the current user
  if (Auth.hasProjectAccess(this.userId, projectId)) {
    return AdventureCommands.find({ projectId: projectId, adventureId: adventureId }, { sort: { dateCreated: 1 } });
  }
  console.warn("Publish: adventure_commands returning nothing for [" + projectId + "], [" + adventureId + "], " + this.userId);
  return [];
});
