import './code_module.html';

import {Template} from 'meteor/templating';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';

import {CodeModules} from '../../../api/code_module/code_module.js';
import {CodeModuleFunctions} from '../../../api/code_module/code_module_function.js';
import {Util} from '../../../api/util.js';

import './code_module_function.js';

/**
 * Template Helpers
 */
Template.CodeModule.helpers({
  codeModuleFunction(){
    let codeModuleFunctionId = FlowRouter.getQueryParam("codeModuleFunctionId");
    if(codeModuleFunctionId){
      return CodeModuleFunctions.findOne(codeModuleFunctionId);
    }
  },
  cleanseUrlParams(){
    console.log("cleanseUrlParams");
    FlowRouter.setQueryParams({codeModuleFunctionId: null});
  }
});

/**
 * Template Event Handlers
 */
Template.CodeModule.events({
  "edited .editable"(e, instance, newValue){
    e.stopImmediatePropagation();
    let dataKey = $(e.target).attr("data-key"),
        update = {$set: {}},
        moduleId = $(e.target).closest(".code-module").attr("data-pk");
    console.log("Edited: ", moduleId, dataKey, newValue);
    
    if(dataKey && moduleId){
      update.$set[dataKey] = newValue;
      CodeModules.update({_id: moduleId}, update, (error, respose) => {
        if(error){
          RobaDialog.error("Updating CodeModule failed: " + error.toString());
          console.error("Failed update context:", dataKey, moduleId, update, error);
        }
      });
    } else {
      console.error("CodeModule Edited event handling failed: dataKey=", dataKey, "moduleId=", moduleId);
    }
  }
});

/**
 * Template Created
 */
Template.CodeModule.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.CodeModule.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CodeModule.onDestroyed(() => {
  
});
