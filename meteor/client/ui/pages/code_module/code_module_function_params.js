import './code_module_function_params.html';

import {Template} from 'meteor/templating';
import {RobaDialog} from 'meteor/austinsand:roba-dialog';

import {CodeModuleFunctionParams} from '../../../../imports/api/code_module/code_module_function_param.js';
import {FunctionParamTypes} from '../../../../imports/api/code_module/function_param_types';

import '../../components/editable_fields/editable_enum selector.js';
import '../../components/editable_fields/editable_field_yes_no.js';
import '../../components/editable_fields/editable_code/editable_code.js';

/**
 * Template Helpers
 */
Template.CodeModuleFunctionParams.helpers({
  paramTypesEnum(){
    return FunctionParamTypes;
  }
});

/**
 * Template Event Handlers
 */
Template.CodeModuleFunctionParams.events({
  "click .btn-add-param"(e, instance){
    let fn = this,
        nextOrder = CodeModuleFunctionParams.find({parentId: fn.staticId, projectVersionId: fn.projectVersionId}).count();
    console.log("Creating new param for", fn.name);
    
    CodeModuleFunctionParams.insert({
      projectId: fn.projectId,
      projectVersionId: fn.projectVersionId,
      parentId: fn.staticId,
      name: "Param" + nextOrder,
      order: nextOrder
    }, (error) => {
      if(error){
        RobaDialog.error("CodeModuleFunctionParams.btn-add-param handler failed:" + error.toString());
      }
    });
  },
  "click .btn-delete"(e, instance){
    let param = this;
  
    console.log("CodeModuleFunctionParams.btn-delete:", param);
    CodeModuleFunctionParams.remove({_id: param._id});
    //RobaDialog.ask("Delete Param", "Are you sure you want to delete the function param");
  },
  "edited .editable"(e, instance, newValue){
    e.stopImmediatePropagation();
    let paramId = $(e.target).closest(".sortable-table-row").attr("data-pk"),
        dataKey = $(e.target).attr("data-key"),
        update = {$set:{}};
    
    console.log("CodeModuleFunctionParams.edited:", dataKey, paramId, newValue);
    if(paramId && dataKey){
      update.$set[dataKey] = newValue;
      CodeModuleFunctionParams.update({_id: paramId}, update, (error) => {
        if(error){
          RobaDialog.error("CodeModuleFunctionParams.edited failed:" + error.toString());
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.CodeModuleFunctionParams.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.CodeModuleFunctionParams.onRendered(() => {
  let instance = Template.instance();
  
  instance.$(".sortable-table")
      .sortable({
        items: "> .sortable-table-row",
        handle: ".drag-handle",
        helper(e, ui) {
          // fix the width
          ui.children().each(function () {
            $(this).width($(this).width());
          });
          return ui;
        },
        axis: "y",
        forcePlaceholderSize: true,
        update(event, ui) {
          var order;
          instance.$(".sortable-table-row").each(function (i, el) {
            order = $(el).attr("data-sort-order");
            if (order != i) {
              console.log("Updating order: ", i, $(el).attr("data-pk"));
              CodeModuleFunctionParams.update($(el).attr("data-pk"), {$set: {order: i}}, function (error, response) {
                if (error) {
                  RobaDialog.error("Param order update failed: " + error.message);
                }
              });
            }
          });
        }
      })
      .disableSelection();
  
});

/**
 * Template Destroyed
 */
Template.CodeModuleFunctionParams.onDestroyed(() => {
  
});
