import './project_invitations_sent.html';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';

import {ProjectInvitations} from '../../../../api/project/project_invitations.js';

/**
 * Template Helpers
 */
Template.ProjectInvitationsSent.helpers({
  invitations: function () {
    return ProjectInvitations.find({projectId: this._id}, {sort: {dateCreated: 1}});
  }
});

/**
 * Template Event Handlers
 */
Template.ProjectInvitationsSent.events({
  "click .btn-resend-ivitation": function (e, instance) {
    var invitation = this;
    Meteor.call("resendInvitation", invitation._id, function (error){
      if(error){
        RobaDialog.error("Invitation Failed: " + error.toString());
      } else {
        RobaDialog.show({title: "Invitation Sent", text: "The invitation email has been re-sent.", buttons: [{ text: "OK" }]});
      }
    });
  },
  "click .btn-delete-ivitation": function (e, instance) {
    var invitation = this;
    RobaDialog.show({
      title: "Delete Invitation?",
      text: "The user will no longer be able to join the project, though they will still have the invitation email.",
      callback: function (btn) {
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
Template.ProjectInvitationsSent.created = function () {
  var instance = this;

  instance.autorun(function () {
    instance.subscribe("invitations_sent", FlowRouter.getParam("projectId"));
  });
};

/**
 * Template Rendered
 */
Template.ProjectInvitationsSent.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.ProjectInvitationsSent.destroyed = function () {
  
};
