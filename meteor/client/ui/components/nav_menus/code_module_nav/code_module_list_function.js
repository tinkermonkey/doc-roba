import './code_module_list_function.html';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

/**
 * Template Helpers
 */
Template.CodeModuleListFunction.helpers({});

/**
 * Template Event Handlers
 */
Template.CodeModuleListFunction.events({
  "click .center-pole-list-item"(e, instance){
    let functionItem = $(e.target).closest(".center-pole-list-item"),
        moduleItem   = $(e.target).closest(".center-pole-list-group-items"),
        list         = $(e.target).closest(".code-module-list");
    
    // Remove select from everything else in the list
    list.find(".center-pole-list-item.selected").removeClass("selected");
    
    // Select this item and set the url params
    functionItem.addClass("selected");
    FlowRouter.setQueryParams({ codeModuleFunctionId: functionItem.attr("data-pk") });
    FlowRouter.setQueryParams({ codeModuleId: moduleItem.attr("data-pk") });
  }
});

/**
 * Template Created
 */
Template.CodeModuleListFunction.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.CodeModuleListFunction.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CodeModuleListFunction.onDestroyed(() => {
  
});
