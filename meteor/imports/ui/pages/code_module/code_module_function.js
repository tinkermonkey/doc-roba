import './code_module_function.html';

import {Template} from 'meteor/templating';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';

import {CodeModuleFunctions} from '../../../api/code_module/code_module_function.js';
import {CodeModuleFunctionParams} from '../../../api/code_module/code_module_function_param.js';

import './code_module_function_params.js';
var Prism = require('prismjs');

/**
 * Template Helpers
 */
Template.CodeModuleFunction.helpers({});

/**
 * Template Event Handlers
 */
Template.CodeModuleFunction.events({
  "edited .editable"(e, instance, newValue){
    e.stopImmediatePropagation();
    let dataKey = $(e.target).attr("data-key"),
        update = {$set: {}},
        functionId = $(e.target).closest(".code-module-function").attr("data-pk");
    console.log("Edited: ", functionId, dataKey, newValue);
    
    if(dataKey && functionId){
      update.$set[dataKey] = newValue;
      CodeModuleFunctions.update({_id: functionId}, update, (error, respose) => {
        if(error){
          RobaDialog.error("Updating CodeModuleFunction failed: " + error.toString());
          console.error("Failed update context:", dataKey, functionId, update, error);
        }
      });
    } else {
      console.error("CodeModuleFunction edited event handling failed: dataKey=", dataKey, "functionId=", functionId);
    }
  },
  "click .btn-delete-function"(e, instance){
    let fn = this;
    RobaDialog.ask("Delete Function", 'Are you sure you want to delete the function <span class="label label-primary"> ' + fn.module().name + '.' + fn.name + '</span> ?', () => {
      CodeModuleFunctions.remove({_id: fn._id});
    });
  }
});

/**
 * Template Created
 */
Template.CodeModuleFunction.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.CodeModuleFunction.onRendered(() => {
  let instance = Template.instance();
  
  instance.$('.editor-footer').html(Prism.highlight('}', Prism.languages.javascript));
  
  instance.autorun(() => {
    console.log("codeModuleFunction autorun");
    //{{module.name}}.{{name}} = function({{#each params}}{{/each}}) {
    let fn = Template.currentData(),
        headerText = fn.module().name + '.' + fn.name + ' = function(' + fn.params().map((param) => { return param.name }).join(', ') + ') {';
      instance.$('.editor-header').html(Prism.highlight(headerText, Prism.languages.javascript));
  })
});

/**
 * Template Destroyed
 */
Template.CodeModuleFunction.onDestroyed(() => {
  
});
