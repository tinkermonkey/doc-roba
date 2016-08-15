import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {TestAgents} from '../test_agent.js';

Meteor.publish("test_agents", function (projectId, projectVersionId) {
  console.debug("Publish: test_agents");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestAgents.find({projectVersionId: projectVersionId});
  }
  return [];
});

Meteor.publish("test_agent", function (projectId, projectVersionId, testAgentId) {
  console.debug("Publish: test_agent");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestAgents.find({projectVersionId: projectVersionId, staticId: testAgentId});
  }
  return [];
});
