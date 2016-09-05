import './code_module_nav.html';

import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/kadira:flow-router';

import {CodeModules} from '../../../api/code_module/code_module.js';

import '../../pages/code_module/code_module_list.js';

/**
 * Template Helpers
 */
Template.CodeModuleNav.helpers({
  projectModules(){
    let projectVersionId = FlowRouter.getParam("projectVersionId");
    return CodeModules.find({projectVersionId: projectVersionId}, {sort: {name: 1}});
  },
  referenceModules(){
    return CodeModules.find({projectVersionId: {$exists: false}}, {sort: {name: 1}});
  }
});

/**
 * Template Event Handlers
 */
Template.CodeModuleNav.events({});

/**
 * Template Created
 */
Template.CodeModuleNav.onCreated(() => {
  let instance = Template.instance();
  
  // Global modules
  instance.subscribe("reference_modules");
  instance.subscribe("reference_module_functions");
  instance.subscribe("reference_module_function_params");
  
  // Maintain subscriptions
  instance.autorun(() => {
    // Needs a projectVersion record as context
    var projectId = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    
    // Modules for this project
    instance.subscribe("code_modules", projectId, projectVersionId);
    instance.subscribe("code_module_functions", projectId, projectVersionId);
    instance.subscribe("code_module_function_params", projectId, projectVersionId);
  });
});

/**
 * Template Rendered
 */
Template.CodeModuleNav.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CodeModuleNav.onDestroyed(() => {
  
});
