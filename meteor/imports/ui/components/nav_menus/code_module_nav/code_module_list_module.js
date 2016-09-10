import './code_module_list_module.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { CodeModuleFunctions } from '../../../../api/code_module/code_module_function.js';
import './code_module_list_function.js';

/**
 * Template Helpers
 */
Template.CodeModuleListModule.helpers({
  isExpanded() {
    return Template.instance().expanded.get();
  }
});

/**
 * Template Event Handlers
 */
Template.CodeModuleListModule.events({
  /**
   * Backstop event handler to prevent form clicks from toggling expanded flag
   * @param e
   * @param instance
   */
  "click .add-item-form"(e, instance){
    e.stopImmediatePropagation();
  },
  /**
   * Toggle the module expanded flag
   * @param e
   * @param instance
   */
  "click .test-case-list-group"(e, instance){
    let item          = $(e.target).closest(".test-case-list-group"),
        expanded      = instance.expanded.get(),
        childSelected = instance.$(".test-case-list-item.selected").length > 0;
    instance.expanded.set(!expanded);
    if (childSelected) {
      item.toggleClass("selected");
    }
  },
  /**
   * Show the add function form
   * @param e
   * @param instance
   */
  "click .btn-add-function-form"(e, instance){
    e.stopImmediatePropagation();
    
    if (instance.$(".add-item-form").hasClass("hide")) {
      $(e.target).closest(".code-module-list").find(".add-item-form").addClass("hide");
      instance.$(".add-item-form").removeClass("hide");
      instance.expanded.set(true);
      instance.$(".add-item-form input").focus();
    } else {
      instance.$(".add-item-form").addClass("hide");
    }
  },
  /**
   * Hide the add function form
   * @param e
   * @param instance
   */
  "click .btn-cancel"(e, instance){
    e.stopImmediatePropagation();
    
    instance.$(".add-item-form").addClass("hide");
  },
  /**
   * Key handler for the add item form
   * @param e
   * @param instance
   */
  "keyup .add-item-form input"(e, instance){
    let value         = $(e.target).val(),
        valid         = e.target.checkValidity(),
        inputGroup    = $(e.target).closest(".input-group"),
        addItemBotton = instance.$(".add-item-form .btn-add-item"),
        module        = this,
        duplicate     = CodeModuleFunctions.find({
          parentId        : module.staticId,
          projectVersionId: module.projectVersionId,
          name            : value
        }).count();
    
    if (valid && !duplicate) {
      // Fully valid
      inputGroup.removeClass("has-error");
      inputGroup.next(".invalid-name").addClass("hide");
      inputGroup.nextAll(".duplicate-name").addClass("hide");
      addItemBotton.removeAttr("disabled");
      
      // If the return key was pressed
      if (e.which == 13) {
        // Return key pressed
        addItemBotton.trigger("click");
      }
    } else {
      addItemBotton.attr("disabled", "disabled");
      inputGroup.addClass("has-error");
      
      if (duplicate) {
        inputGroup.nextAll(".duplicate-name.hide").removeClass("hide");
      } else {
        inputGroup.next(".invalid-name.hide").removeClass("hide");
      }
    }
  },
  /**
   * Insert a new function
   * @param e
   * @param instance
   */
  "click .btn-add-item"(e, instance){
    let itemName  = instance.$(".add-item-form input").val().trim(),
        module    = instance.data,
        valid     = instance.$(".add-item-form input").get(0).checkValidity(),
        duplicate = CodeModuleFunctions.find({
          parentId        : module.staticId,
          projectVersionId: module.projectVersionId,
          name            : itemName
        }).count();
    
    if (valid && !duplicate) {
      //console.log("Add code module function: ", itemName, duplicate, module);
      if (itemName.length && module.staticId) {
        CodeModuleFunctions.insert({
          projectId       : module.projectId,
          projectVersionId: module.projectVersionId,
          parentId        : module.staticId,
          name            : itemName,
          language        : module.language
        }, (error, functionId) => {
          if (error) {
            RobaDialog.error("Inserting function failed:" + error.toString());
          } else {
            console.debug("Function inserted:", functionId);
            // clear the value
            instance.$(".add-item-form input").val("");
            
            // Select the new function
            let selectedModule = FlowRouter.getQueryParam("codeModuleId");
            if (selectedModule == module._id) {
              FlowRouter.setQueryParams({ codeModuleFunctionId: functionId });
            }
          }
        });
      }
    } else {
      console.log("Invalid:", itemName);
    }
  }
});

/**
 * Template Created
 */
Template.CodeModuleListModule.onCreated(() => {
  let instance      = Template.instance();
  instance.expanded = new ReactiveVar(false);
});

/**
 * Template Rendered
 */
Template.CodeModuleListModule.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CodeModuleListModule.onDestroyed(() => {
  
});
