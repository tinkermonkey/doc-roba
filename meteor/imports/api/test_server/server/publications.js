import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {Servers} from '../server.js';

Meteor.publish("servers", function (projectId, projectVersionId) {
  console.debug("Publish: servers");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return Servers.find({projectVersionId: projectVersionId});
  }
  return [];
});

Meteor.publish("server", function (projectId, projectVersionId, serverId) {
  console.debug("Publish: server");
  // check that there is a project role for the current user
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return Servers.find({projectVersionId: projectVersionId, staticId: serverId});
  }
  return [];
});
