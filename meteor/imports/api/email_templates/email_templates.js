import {Projects} from '../project/project.js';
import {ProjectInvitations} from '../project/project_invitations.js';

export const EmailTemplates = {
  ProjectInvitation: {
    path: "project_invitation/project_invitation.html",
    route: {
      path: "/project_invitation/:invitationId",
      data: function (params) {
        console.log("Invitation Preview: ", params);
        var invitation = ProjectInvitations.findOne(params.invitationId),
            project = Projects.findOne(invitation.projectId);
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
  }
};