/**
 * Template Helpers
 */
Template.ProjectInvitationsSent.helpers({
  invitations: function () {
    return Collections.ProjectInvitations.find({projectId: this._id}, {sort: {dateCreated: 1}});
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
        Dialog.error("Invitation Failed: " + error.toString());
      } else {
        Dialog.show({title: "Invitation Sent", text: "The invitation email has been re-sent.", buttons: [{ text: "OK" }]});
      }
    });
  },
  "click .btn-delete-ivitation": function (e, instance) {
    var invitation = this;
    Dialog.show({
      title: "Delete Invitation?",
      text: "The user will no longer be able to join the project, though they will still have the invitation email.",
      callback: function (btn) {
        Dialog.hide();
        if(btn == "OK"){
          Meteor.call("deleteInvitation", invitation._id, function (error){
            if(error){
              Dialog.error("Deleting Invitation Failed: " + error.toString());
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
