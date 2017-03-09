import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {TestServers} from '../test_server.js';

Meteor.publish("test_servers", function (projectId, projectVersionId) {
  console.debug("Publish: test_servers");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestServers.find({projectVersionId: projectVersionId});
  }
  return [];
});

Meteor.publish("test_server", function (projectId, projectVersionId, serverId) {
  console.debug("Publish: test_server");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestServers.find({projectVersionId: projectVersionId, staticId: serverId});
  }
  return [];
});
