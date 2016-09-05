import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';

import {CodeModules} from '../code_module.js';
import {CodeModuleFunctions} from '../code_module_function.js';
import {CodeModuleFunctionParams} from '../code_module_function_param.js';

Meteor.publish("code_modules", function (projectId, projectVersionId) {
  console.debug("Publish: code_modules", projectId, projectVersionId);
  if (Auth.hasProjectAccess(this.userId, projectId) && projectVersionId) {
    console.log("code_modules:", {projectVersionId: projectVersionId});
    console.log("code_modules:", CodeModules.find({projectVersionId: projectVersionId}).count());
    return CodeModules.find({projectVersionId: projectVersionId});
  }
  console.warn("Publish: code_modules returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});

Meteor.publish("code_module_functions", function (projectId, projectVersionId) {
  console.debug("Publish: code_module_functions", projectId, projectVersionId);
  if (Auth.hasProjectAccess(this.userId, projectId) && projectVersionId) {
    return CodeModuleFunctions.find({projectVersionId: projectVersionId});
  }
  console.warn("Publish: code_module_functions returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});

Meteor.publish("code_module_function_params", function (projectId, projectVersionId) {
  console.debug("Publish: code_module_function_params", projectId, projectVersionId);
  if (Auth.hasProjectAccess(this.userId, projectId) && projectVersionId) {
    return CodeModuleFunctionParams.find({projectVersionId: projectVersionId});
  }
  console.warn("Publish: code_module_function_params returning nothing for [" + projectId + "], [" + projectVersionId + "], " + this.userId);
  return [];
});

Meteor.publish("reference_modules", function () {
  console.debug("Publish: reference_modules");
  if (this.userId) {
    return CodeModules.find({projectVersionId: {$exists: false}});
  }
  console.warn("Publish: reference_modules returning nothing");
  return [];
});

Meteor.publish("reference_module_functions", function () {
  console.debug("Publish: reference_module_functions");
  if (this.userId) {
    return CodeModuleFunctions.find({projectVersionId: {$exists: false}});
  }
  console.warn("Publish: reference_module_functions returning nothing");
  return [];
});

Meteor.publish("reference_module_function_params", function () {
  console.debug("Publish: reference_module_function_params");
  if (this.userId) {
    return CodeModuleFunctionParams.find({projectVersionId: {$exists: false}});
  }
  console.warn("Publish: reference_module_function_params returning nothing");
  return [];
});
