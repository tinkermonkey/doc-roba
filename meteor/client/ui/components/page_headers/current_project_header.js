import './current_project_header.html';

import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/kadira:flow-router';

import {Projects} from '../../../../imports/api/projects/projects.js';
import {ProjectVersions} from '../../../../imports/api/projects/project_versions.js';

/**
 * Template Helpers
 */
Template.CurrentProjectHeader.helpers({
  project() {
    return Template.instance().project.get()
  },
  version() {
    return Template.instance().version.get()
  }
});

/**
 * Template Event Handlers
 */
Template.CurrentProjectHeader.events({});

/**
 * Template Created
 */
Template.CurrentProjectHeader.created = function () {
  let instance = Template.instance();
  instance.project = new ReactiveVar();
  instance.version = new ReactiveVar();

  instance.autorun(function () {
    var projectId = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    if(projectId){
      instance.project.set(Projects.findOne(projectId));
    }
    if(projectVersionId){
      instance.version.set(ProjectVersions.findOne(projectVersionId));
    }
  });

};

/**
 * Template Rendered
 */
Template.CurrentProjectHeader.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.CurrentProjectHeader.destroyed = function () {
  
};
