import './project_team.html';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';

import {ProjectRoles, ProjectRolesLookup} from '../../../../api/project/project_roles.js';
import {Users} from '../../../../api/users/users.js';

import {Util} from '../../../../api/util.js';
import './project_invitations_sent.js';
import '../../../components/datastores/datastore_row_form_vert.js';

/**
 * Template Helpers
 */
Template.ProjectTeam.helpers({
  projectUsers: function () {
    return Users.find({projectList: FlowRouter.getParam("projectId")}, {sort: {"profile.name": 1}});
  },
  projectRoles: function () {
    var projectId = FlowRouter.getParam("projectId"),
        user = this;
    if(user && projectId && user.projects && user.projects[projectId]){
      return user.projects[projectId].roles
    }
  },
  userIsAdmin: function () {
    return Meteor.user().hasAdminAccess(FlowRouter.getParam("projectId"))
  },
  isCurrentUser: function (userId) {
    return Meteor.userId() != userId && !_.isNull(userId)
  }
});

/**
 * Template Event Handlers
 */
Template.ProjectTeam.events({
  "click .btn-invite-user": function (e, instance) {
    // Build the form context
    var formContext = {
      type: "update",
      rowSchema: new SimpleSchema({
        name: {
          type: String
        },
        email: {
          type: String,
          regEx: SimpleSchema.RegEx.Email
        },
        role: {
          type: Number,
          allowedValues: _.map(ProjectRoles, function (d) { return d; }),
          autoform: {
            options: _.map(ProjectRoles, function (d) { return {label: Util.capitalize(ProjectRolesLookup[d]), value: d}; })
          }
        }
      }),
      rowData: {}
    };

    // render the form
    RobaDialog.show({
      contentTemplate: 'DatastoreRowFormVert',
      contentData: formContext,
      title: "Send project invitation",
      buttons: [
        { text: "Cancel" },
        { text: "Send" }
      ],
      callback: function (btn) {
        console.log("Dialog button pressed: ", btn);
        if(btn == "Send"){
          // grab the form data
          var formId = RobaDialog.currentInstance.$("form").attr("id");
          if(formId && AutoForm.validateForm(formId)){
            var invite = _.clone(AutoForm.getFormValues(formId).insertDoc);

            // send the invite
            Meteor.call("inviteUser", invite.email, invite.name, invite.role, instance.data._id, function (error) {
              RobaDialog.hide(function () {
                if(error) {
                  RobaDialog.error("Sending invite failed: " + error.toString());
                }
              });
            });
          }
        } else {
          RobaDialog.hide();
        }
      }
    });
  },
  "click .btn-remove-role": function (e, instance) {
    var role = parseInt(this),
        userId = $(e.target).closest(".data-store-table-row").attr("data-user-id"),
        projectId = instance.data._id;

    RobaDialog.ask("Remove Role?", "Remove this role from this user?", function () {
      Meteor.call("removeProjectRole", userId, projectId, role, function (error) {
        if(error) {
          RobaDialog.error("Removing role failed: " + error.toString());
        }
      });
    });
  },
  "click .btn-add-role": function (e, instance) {
    var userId = $(e.target).closest(".data-store-table-row").attr("data-user-id"),
        user = Meteor.users.findOne(userId),
        projectId = instance.data._id;

    console.log("add role: ", userId, user, user.projects[projectId].roles, _.difference(ProjectRoles, user.projects[projectId].roles));
    // Build the form context
    var formContext = {
      type: "update",
      rowSchema: new SimpleSchema({
        role: {
          type: Number,
          allowedValues: _.map(ProjectRoles, function (d) { return d; }),
          autoform: {
            options: _.map(_.difference(ProjectRoles, user.projects[projectId].roles), function (d) { return {label: Util.capitalize(ProjectRolesLookup[d]), value: d}; })
          }
        }
      }),
      rowData: {}
    };

    // render the form
    RobaDialog.show({
      contentTemplate: 'DatastoreRowFormVert',
      contentData: formContext,
      title: "Add project role",
      callback: function (btn) {
        console.log("Dialog button pressed: ", btn);
        if(btn == "OK"){
          var formId = RobaDialog.currentInstance.$("form").attr("id");
          if(formId && AutoForm.validateForm(formId)) {
            var roleForm = _.clone(AutoForm.getFormValues(formId).insertDoc);

            Meteor.call("addProjectRole", userId, projectId, roleForm.role, function (error) {
              RobaDialog.hide(function () {
                if (error) {
                  RobaDialog.error("Adding role failed: " + error.toString());
                }
              });
            });
          }
        } else {
          RobaDialog.hide();
        }
      }
    });
  },
  "click .btn-remove-access": function (e, instance) {
    var userId = $(e.target).closest(".data-store-table-row").attr("data-user-id"),
        projectId = instance.data._id;

    RobaDialog.ask("Revoke Project Access?", "This user will no longer have any access to this project", function () {
      Meteor.call("removeProjectAccess", userId, projectId, function (error) {
        if(error) {
          RobaDialog.error("Revoking access failed: " + error.toString());
        }
      });
    });
  }
});

/**
 * Template Created
 */
Template.ProjectTeam.created = function () {
  
};

/**
 * Template Rendered
 */
Template.ProjectTeam.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.ProjectTeam.destroyed = function () {
  
};
