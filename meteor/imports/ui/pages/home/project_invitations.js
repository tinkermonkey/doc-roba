import './project_invitations.html';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';

import {ProjectInvitations} from '../../../api/project/project_invitations.js';

/**
 * Template Helpers
 */
Template.ProjectInvitations.helpers({
  invitations() {
    var user = Meteor.user();
    return ProjectInvitations.find({inviteeEmail: {$in: _.map(user.emails, function (email) {return email.address}) }});
  }
});

/**
 * Template Event Handlers
 */
Template.ProjectInvitations.events({
  "click .btn-accept-ivitation"(e, instance) {
    var invitation = this;
    Meteor.call("acceptInvitation", invitation._id, function (error){
      if(error){
        RobaDialog.error("Accepting Invitation Failed: " + error.toString());
      }
    });
  },
  "click .btn-delete-ivitation"(e, instance) {
    var invitation = this;
    RobaDialog.show({
      title: "Delete Invitation?",
      text: "You will no longer be the option to join this project.",
      callback(btn) {
        RobaDialog.hide();
        if(btn == "OK"){
          Meteor.call("deleteInvitation", invitation._id, function (error){
            if(error){
              RobaDialog.error("Deleting Invitation Failed: " + error.toString());
            }
          });
        }
      }
    });
  }
});

/**
 * Template Created
 */
Template.ProjectInvitations.created = function () {
  let instance = Template.instance();

  instance.subscribe("user_invitations");
};

/**
 * Template Rendered
 */
Template.ProjectInvitations.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.ProjectInvitations.destroyed = function () {
  
};
