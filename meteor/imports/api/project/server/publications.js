import {Meteor} from 'meteor/meteor';
import {Projects} from '../project.js';
import {ProjectVersions} from '../project_version.js';
import {ProjectInvitations} from '../project_invitations.js';

Meteor.publish("projects", (projectList) => {
  console.debug("Publish: projects");
  if(this.userId){
    let user = Meteor.users.findOne(this.userId);
    return Projects.find({_id: {$in: user.projectList || [] }, active: true});
  }
  console.warn("Publish: projects returning nothing");
  return [];
});

Meteor.publish("project_versions", (projectList) => {
  console.debug("Publish: project_versions");
  if(this.userId){
    let user = Meteor.users.findOne(this.userId);
    return ProjectVersions.find({projectId: {$in: user.projectList || [] }, active: true});
  }
  console.warn("Publish: project_versions returning nothing");
  return [];
});

// All projects the user has a role for
Meteor.publish("all_projects", (projectList) => {
  console.debug("Publish: all_projects");
  if(this.userId){
    let user = Meteor.users.findOne(this.userId);
    return Projects.find({_id: {$in: user.projectList || [] }});
  }
  console.warn("Publish: all_projects returning nothing");
  return [];
});

// Invitations to join other projects
Meteor.publish("user_invitations", () => {
  console.debug("Publish: user_invitations");
  if(this.userId){
    let user = Meteor.users.findOne(this.userId);
    return ProjectInvitations.find({inviteeEmail: {$in: _.map(user.emails, (email) => {return email.address}) }});
  }
  console.warn("Publish: user_invitations returning nothing");
  return [];
});

// Invitations sent for a project
Meteor.publish("invitations_sent", (projectId) =>{
  console.debug("Publish: invitations_sent");
  if(Auth.hasProjectAccess(this.userId, projectId)){
    return ProjectInvitations.find({projectId: projectId});
  }
  console.warn("Publish: user_invitations returning nothing");
  return [];
});
