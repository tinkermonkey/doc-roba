/**
 * Template Helpers
 */
Template.ProjectTeam.helpers({
  projectUsers: function () {
    return Collections.Users.find({projectList: FlowRouter.getParam("projectId")}, {sort: {"profile.name": 1}});
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
          allowedValues: _.map(RoleTypes, function (d) { return d; }),
          autoform: {
            options: _.map(RoleTypes, function (d) { return {label: Util.capitalize(RoleTypesLookup[d]), value: d}; })
          }
        }
      }),
      rowData: {}
    };

    // render the form
    Dialog.show({
      contentTemplate: 'DataStoreRowFormVert',
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
          var formId = Dialog.currentInstance.$("form").attr("id");
          if(formId && AutoForm.validateForm(formId)){
            var invite = _.clone(AutoForm.getFormValues(formId).insertDoc);

            // send the invite
            Meteor.call("inviteUser", invite.email, invite.name, invite.role, instance.data._id, function (error) {
              Dialog.hide(function () {
                if(error) {
                  Dialog.error("Sending invite failed: " + error.toString());
                }
              });
            });
          }
        } else {
          Dialog.hide();
        }
      }
    });
  },
  "click .btn-remove-role": function (e, instance) {
    var role = parseInt(this),
        userId = $(e.target).closest(".data-store-table-row").attr("data-user-id"),
        projectId = instance.data._id;

    Dialog.ask("Remove Role?", "Remove this role from this user?", function () {
      Meteor.call("removeProjectRole", userId, projectId, role, function (error) {
        if(error) {
          Dialog.error("Removing role failed: " + error.toString());
        }
      });
    });
  },
  "click .btn-add-role": function (e, instance) {
    var userId = $(e.target).closest(".data-store-table-row").attr("data-user-id"),
        user = Meteor.users.findOne(userId),
        projectId = instance.data._id;

    console.log("add role: ", userId, user, user.projects[projectId].roles, _.difference(RoleTypes, user.projects[projectId].roles));
    // Build the form context
    var formContext = {
      type: "update",
      rowSchema: new SimpleSchema({
        role: {
          type: Number,
          allowedValues: _.map(RoleTypes, function (d) { return d; }),
          autoform: {
            options: _.map(_.difference(RoleTypes, user.projects[projectId].roles), function (d) { return {label: Util.capitalize(RoleTypesLookup[d]), value: d}; })
          }
        }
      }),
      rowData: {}
    };

    // render the form
    Dialog.show({
      contentTemplate: 'DataStoreRowFormVert',
      contentData: formContext,
      title: "Add project role",
      callback: function (btn) {
        console.log("Dialog button pressed: ", btn);
        if(btn == "OK"){
          var formId = Dialog.currentInstance.$("form").attr("id");
          if(formId && AutoForm.validateForm(formId)) {
            var roleForm = _.clone(AutoForm.getFormValues(formId).insertDoc);

            Meteor.call("addProjectRole", userId, projectId, roleForm.role, function (error) {
              Dialog.hide(function () {
                if (error) {
                  Dialog.error("Adding role failed: " + error.toString());
                }
              });
            });
          }
        } else {
          Dialog.hide();
        }
      }
    });
  },
  "click .btn-remove-access": function (e, instance) {
    var userId = $(e.target).closest(".data-store-table-row").attr("data-user-id"),
        projectId = instance.data._id;

    Dialog.ask("Revoke Project Access?", "This user will no longer have any access to this project", function () {
      Meteor.call("removeProjectAccess", userId, projectId, function (error) {
        if(error) {
          Dialog.error("Revoking access failed: " + error.toString());
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
