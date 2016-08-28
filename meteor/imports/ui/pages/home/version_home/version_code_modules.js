import './version_code_modules.html';

import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/kadira:flow-router';

import '../../../views/code_modules/code_modules.js';

/**
 * Template Helpers
 */
Template.VersionCodeModules.helpers({
  projectId(){
    return FlowRouter.getParam("projectId")
  },
  projectVersionId(){
    return FlowRouter.getParam("projectVersionId")
  }
});

/**
 * Template Event Handlers
 */
Template.VersionCodeModules.events({});

/**
 * Template Created
 */
Template.VersionCodeModules.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.VersionCodeModules.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.VersionCodeModules.onDestroyed(() => {
  
});
