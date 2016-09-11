import './code_module_list.html';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import './code_module_list_module.js';

/**
 * Template Helpers
 */
Template.CodeModuleList.helpers({});

/**
 * Template Event Handlers
 */
Template.CodeModuleList.events({
});

/**
 * Template Created
 */
Template.CodeModuleList.onCreated(() => {
  let instance = Template.instance();
  instance.elementIdReactor = new ReactiveVar();
});

/**
 * Template Rendered
 */
Template.CodeModuleList.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let codeModuleId = FlowRouter.getQueryParam("codeModuleId"),
        functionId = FlowRouter.getQueryParam("codeModuleFunctionId"),
        elementId = instance.elementIdReactor.get();
  
    setTimeout(() => {
      if(functionId && elementId) {
        let item = instance.$(".test-case-list-item[data-pk='" + functionId + "']"),
            module = instance.$(".test-case-list-group[data-pk='" + codeModuleId + "']");
  
        instance.$(".test-case-list-item").removeClass("selected");
        item.addClass("selected");
        module.each(function (i, el) {
          Blaze.getView(el).templateInstance().expanded.set(true);
        });
      } else if(codeModuleId && elementId){
        instance.$(".test-case-list-group[data-pk='" + codeModuleId + "']").each(function (i, el) {
          Blaze.getView(el).templateInstance().expanded.set(true);
        });
      }
    }, 100);
  })
});

/**
 * Template Destroyed
 */
Template.CodeModuleList.onDestroyed(() => {
  
});
