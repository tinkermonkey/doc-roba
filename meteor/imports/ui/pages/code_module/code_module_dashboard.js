import './code_module_dashboard.html';
import './code_modules.css';

import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/kadira:flow-router';

import {CodeModules} from '../../../api/code_module/code_module.js';
import {CodeModuleFunctions} from '../../../api/code_module/code_module_function.js';
import {CodeModuleFunctionParams} from '../../../api/code_module/code_module_function_param.js';
import {Projects} from '../../../api/project/project.js';
import {ProjectVersions} from '../../../api/project/project_version.js';

import '../../components/page_headers/current_project_header.js';
import '../../components/nav_menus/code_module_nav.js';
import './code_module.js';

/**
 * Template Helpers
 */
Template.CodeModuleDashboard.helpers({
  project(){
    let projectId = FlowRouter.getParam("projectId");
    return Projects.findOne(projectId);
  },
  projectVersion(){
    return Template.instance().version.get();
  },
  projectModules(){
    let projectVersionId = FlowRouter.getParam("projectVersionId");
    return CodeModules.find({projectVersionId: projectVersionId}, {sort: {name: 1}});
  },
  referenceModules(){
    return CodeModules.find({projectVersionId: {$exists: false}}, {sort: {name: 1}});
  },
  codeModuleId: function () {
    console.log("codeModuleId:", FlowRouter.getQueryParam("codeModuleId"));
    return FlowRouter.getQueryParam("codeModuleId")
  },
  codeModule: function () {
    var codeModuleId = FlowRouter.getQueryParam("codeModuleId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    if(codeModuleId && projectVersionId){
      return CodeModules.findOne(codeModuleId);
    }
  }
  
});

/**
 * Template Event Handlers
 */
Template.CodeModuleDashboard.events({});

/**
 * Template Created
 */
Template.CodeModuleDashboard.onCreated(() => {
  let instance = Template.instance();
  instance.version = new ReactiveVar();
  
  // Global modules
  instance.subscribe("reference_modules");
  instance.subscribe("reference_module_functions");
  instance.subscribe("reference_module_function_params");
  
  // Maintain subscriptions
  instance.autorun(() => {
    // Needs a projectVersion record as context
    var projectId = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    
    // User types for the project
    instance.subscribe("user_types", projectId, projectVersionId);
  
    // Modules for this project
    instance.subscribe("code_modules", projectId, projectVersionId);
    instance.subscribe("code_module_functions", projectId, projectVersionId);
    instance.subscribe("code_module_function_params", projectId, projectVersionId);
    
    // Cache the version record
    if(instance.subscriptionsReady()){
      instance.version.set(ProjectVersions.findOne({_id: projectVersionId}));
    }
  });
  
  // Make sure the project has all of the modules it should
  instance.autorun(() => {
    let version = instance.version.get();
    
    if(version && version.checkCodeModules){
      try {
        version.checkCodeModules();
      } catch(e) {
        console.error("[CodeModules.autorun] version.checkCodeModules failed: ", e)
      }
    }
  })
});

/**
 * Template Rendered
 */
Template.CodeModuleDashboard.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CodeModuleDashboard.onDestroyed(() => {
  
});
