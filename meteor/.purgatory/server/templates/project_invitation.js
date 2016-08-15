EmailTemplates.ProjectInvitation = {
  path: "project_invitation/project_invitation.html",
  route: {
    path: "/project_invitation/:invitationId",
    data: function (params) {
      console.log("Invitation Preview: ", params);
      var invitation = Collections.ProjectInvitations.findOne(params.invitationId),
          project = Collections.Projects.findOne(invitation.projectId);
      console.log("Invitation Preview: ", invitation);
      /*
      return invitation
      */
      return {
        project: project,
        invitation: invitation
      };
    }
  }
};