import './project_home.html';

import {Template} from 'meteor/templating';

import {Projects} from '../../../../api/project/project.js';

import {Tabs} from '../../../components/tabs/tabs.js';
import './project_activity.js';
import './project_team.js';
import './project_versions.js';

/**
 * Template Helpers
 */
Template.ProjectHome.helpers({
  project: function () {
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
  var instance = this;
  instance.project = new ReactiveVar();

  instance.autorun(function () {
    instance.project.set(Projects.findOne(FlowRouter.getParam("projectId")));
  });
};

/**
 * Template Rendered
 */
Template.ProjectHome.rendered = function () {
  var instance = this;

  instance.autorun(function () {
    var ready = instance.subscriptionsReady(),
        project = instance.project.get();
    if(ready && project){
      Tabs.init(instance);
    }
  });
};

/**
 * Template Destroyed
 */
Template.ProjectHome.destroyed = function () {
  
};
