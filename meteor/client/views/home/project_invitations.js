/**
 * Template Helpers
 */
Template.ProjectInvitations.helpers({
  invitations: function () {
    var user = Meteor.user();
    return Collections.ProjectInvitations.find({inviteeEmail: {$in: _.map(user.emails, function (email) {return email.address}) }});
  }
});

/**
 * Template Event Handlers
 */
Template.ProjectInvitations.events({
  "click .btn-accept-ivitation": function (e, instance) {
    var invitation = this;
    Meteor.call("acceptInvitation", invitation._id, function (error){
      if(error){
        Dialog.error("Accepting Invitation Failed: " + error.toString());
      }
    });
  },
  "click .btn-delete-ivitation": function (e, instance) {
    var invitation = this;
    Dialog.show({
      title: "Delete Invitation?",
      text: "You will no longer be the option to join this project.",
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
Template.ProjectInvitations.created = function () {
  var instance = this;

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
