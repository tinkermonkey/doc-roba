import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {Projects} from '../project.js';
import {ProjectVersions} from '../project_version.js';
import {ProjectInvitations} from '../project_invitations.js';

Meteor.publish("projects", function (projectList) {
  console.debug("Publish: projects", projectList, this.userId);
  if(this.userId ){
    let user = Meteor.users.findOne(this.userId );
    console.log("Getting projects for ", this.userId , Projects.find({_id: {$in: user.projectList || [] }, active: true}).fetch());
    return Projects.find({_id: {$in: user.projectList || [] }, active: true});
  }
  console.warn("Publish: projects returning nothing");
  this.ready();
});

Meteor.publish("project_versions", function (projectList) {
  console.debug("Publish: project_versions", projectList);
  if(this.userId ){
    let user = Meteor.users.findOne(this.userId );
    return ProjectVersions.find({projectId: {$in: user.projectList || [] }, active: true});
  }
  console.warn("Publish: project_versions returning nothing");
  this.ready();
});

// All projects the user has a role for
Meteor.publish("all_projects", function (projectList) {
  console.debug("Publish: all_projects", projectList);
  if(this.userId ){
    let user = Meteor.users.findOne(this.userId );
    return Projects.find({_id: {$in: user.projectList || [] }});
  }
  console.warn("Publish: all_projects returning nothing");
  this.ready();
});

// Invitations to join other projects
Meteor.publish("user_invitations", function () {
  console.debug("Publish: user_invitations");
  if(this.userId ){
    let user = Meteor.users.findOne(this.userId );
    return ProjectInvitations.find({inviteeEmail: {$in: _.map(user.emails, (email) => {return email.address}) }});
  }
  console.warn("Publish: user_invitations returning nothing");
  this.ready();
});

// Invitations sent for a project
Meteor.publish("invitations_sent", function (projectId) {
  console.debug("Publish: invitations_sent", projectId);
  if(Auth.hasProjectAccess(this.userId , projectId)){
    return ProjectInvitations.find({projectId: projectId});
  }
  console.warn("Publish: user_invitations returning nothing");
  this.ready();
});
