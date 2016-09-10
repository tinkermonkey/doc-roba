import './project_home.html';

import {Template} from 'meteor/templating';

import {Projects} from '../../../../api/project/project.js';

import '../../../components/page_headers/current_project_header.js';
import '../home_nav.js';
import './project_activity.js';
import './project_team.js';
import './project_versions.js';

/**
 * Template Helpers
 */
Template.ProjectHome.helpers({
  project() {
    return Template.instance().project.get()
  }
});

/**
 * Template Event Handlers
 */
Template.ProjectHome.events({});

/**
 * Template Created
 */
Template.ProjectHome.created = function () {
  let instance = Template.instance();
  instance.project = new ReactiveVar();

  instance.autorun(function () {
    instance.project.set(Projects.findOne(FlowRouter.getParam("projectId")));
  });
};

/**
 * Template Rendered
 */
Template.ProjectHome.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.ProjectHome.destroyed = function () {
  
};
