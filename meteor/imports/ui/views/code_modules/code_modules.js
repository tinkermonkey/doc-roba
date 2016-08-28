import './code_modules.html';

import {Template} from 'meteor/templating';

/**
 * Template Helpers
 */
Template.CodeModules.helpers({});

/**
 * Template Event Handlers
 */
Template.CodeModules.events({});

/**
 * Template Created
 */
Template.CodeModules.onCreated(() => {
  let self = Template.instance();
  
  self.autorun(() => {
    let data = Template.currentData();
  
    self.subscribe("code_modules", data.projectId, data.projectVersionId);
    self.subscribe("code_module_functions", data.projectId, data.projectVersionId);
    self.subscribe("code_module_function_params", data.projectId, data.projectVersionId);
    
    self.subscribe("reference_modules");
    self.subscribe("reference_module_functions");
    self.subscribe("reference_module_function_params");
  })
});

/**
 * Template Rendered
 */
Template.CodeModules.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CodeModules.onDestroyed(() => {
  
});
