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
      contentTemplate: 'DataStoreRowForm',
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
            console.log("invite:", invite);
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
