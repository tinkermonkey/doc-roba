import './code_module_list_function.html';

import {Template} from 'meteor/templating';

/**
 * Template Helpers
 */
Template.CodeModuleListFunction.helpers({});

/**
 * Template Event Handlers
 */
Template.CodeModuleListFunction.events({
  "click .test-case-list-item"(e, instance){
    let functionItem = $(e.target).closest(".test-case-list-item"),
        moduleItem = $(e.target).closest(".test-case-list-group-items"),
        list = $(e.target).closest(".code-module-list");
    
    // Remove select from everything else in the list
    list.find(".test-case-list-item.selected").removeClass("selected");
    
    // Select this item and set the url params
    functionItem.addClass("selected");
    FlowRouter.setQueryParams({codeModuleFunctionId: functionItem.attr("data-pk")});
    FlowRouter.setQueryParams({codeModuleId: moduleItem.attr("data-pk")});
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
