import './project_list.html';

import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

/**
 * Template Helpers
 */
Template.ProjectList.helpers({
  inactiveProjects: function () {
    var user = Meteor.user();
    if(user && user.projectList){
      return Collections.Projects.find({_id: {$in: user.projectList}, active: false}, {sort: {title: 1}});
    }
  },
  user: function () {
    return Meteor.users.findOne(Meteor.userId())
  },
  canCreateProjects: function () {
    return Meteor.user().isSystemAdmin || Meteor.settings.allowPersonalProjects;
  },
  projectRoles: function () {
    var user = Meteor.user(),
        projectId = this._id;
    if(projectId && user.projects[projectId] && user.projects[projectId].roles){
      return _.sortBy(user.projects[projectId].roles, function (role) {return role})
    }
  }
});

/**
 * Template Event Handlers
 */
Template.ProjectList.events({
  "click .btn-create-project": function (e, instance) {
    // Build the form context
    var formContext = {
      type: "update",
      rowSchema: new SimpleSchema({
        title: {
          type: String
        },
        initialVersion: {
          type: String
        }
      }),
      rowData: {}
    };

    // render the form
    Dialog.show({
      contentTemplate: 'DataStoreRowFormVert',
      contentData: formContext,
      title: "Create Project",
      buttons: [
        { text: "Cancel" },
        { text: "Create" }
      ],
      callback: function (btn) {
        console.log("Dialog button pressed: ", btn);
        if(btn == "Create"){
          // grab the form data
          var formId = Dialog.currentInstance.$("form").attr("id");
          if(formId && AutoForm.validateForm(formId)){
            var newProject = _.clone(AutoForm.getFormValues(formId).insertDoc);

            Meteor.call("createProject", newProject.title, newProject.initialVersion, function (error) {
              Dialog.hide(function () {
                if(error){
                  Dialog.error("Creating project failed: " + error.toString());
                }
              });
            });
          } else {
            console.error("Creating project failed: could not find form");
          }
        } else {
          Dialog.hide();
        }
      }
    });
  },
  "click .btn-delete-project": function (e, instance) {
    var project = this;
    Dialog.show({
      contentData: { text: "Deleting this project will permanently remove all data associated with this project. Are you sure this is what you want to do?" },
      callback: function (btn) {
        if(btn == "OK"){
          Meteor.call("deleteProject", project._id, function (error, result) {
            Dialog.hide(function () {
              if(error){
                Dialog.error("Deleting project failed: " + error.toString());
              }
            });
          });
        } else {
          Dialog.hide();
        }
      }
    });
  },
  "click .btn-deactivate-project": function (e, instance) {
    var project = this;

    Dialog.show({
      contentData: { text: "Deactivating this project will remove all user's access to it. Only project adminstrators will be able to see it. Are you sure this is what you want to do?" },
      callback: function (btn) {
        if(btn == "OK"){
          Collections.Projects.update(project._id, {$set: {active: false}});
        }
        Dialog.hide();
      }
    });
  },
  "click .btn-activate-project": function (e, instance) {
    var project = this;
    Dialog.show({
      contentData: { text: "Activating this project will restore user's access to it. Are you sure this is what you want to do?" },
      callback: function (btn) {
        if(btn == "OK"){
          Collections.Projects.update(project._id, {$set: {active: true}});
        }
        Dialog.hide();
      }
    });
  },
  "click .btn-remove-role": function (e, instance) {

  }
});

/**
 * Template Created
 */
Template.ProjectList.created = function () {
  var instance = this;

  instance.subscribe("all_projects");
};

/**
 * Template Rendered
 */
Template.ProjectList.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.ProjectList.destroyed = function () {
  
};
