import './node_check_edit_list.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { NodeChecks } from '../../../../imports/api/node/node_check.js';
import { NodeCheckTypes, NodeCheckTypesLookup } from '../../../../imports/api/node/node_check_types.js';
import { NodeReadyCheckFns } from '../../../../imports/api/node/node_ready_check_fns.js';
import { NodeValidCheckFns } from '../../../../imports/api/node/node_valid_check_fns.js';
import { Util } from '../../../../imports/api/util.js';
import '../editable_fields/editable_enum selector.js';
import '../editable_fields/editable_xpath.js';

/**
 * Template Helpers
 */
Template.NodeCheckEditList.helpers({
  /**
   * Get the list of node checks for this node
   */
  nodeChecks () {
    return NodeChecks.find({
      parentId        : this.node.staticId,
      projectVersionId: this.node.projectVersionId,
      type            : this.type
    });
  },
  
  /**
   * Get the correct enum for this list
   */
  checkFnType () {
    return Util.camelToTitle(NodeCheckTypesLookup[ this.type ])
  },
  
  /**
   * Get the correct enum for this list
   */
  checkFnEnum () {
    if (this.type == NodeCheckTypes.ready) {
      return NodeReadyCheckFns;
    } else {
      return NodeValidCheckFns;
    }
  },
  
  /**
   * Get the list of args for this function
   */
  checkFnArgList () {
    let fnList  = this.type == NodeCheckTypes.ready ? NodeReadyCheckFns : NodeValidCheckFns,
        checkFn = fnList[ this.checkFn ];
    if (checkFn && checkFn.args && checkFn.args.length) {
      return checkFn.args
    }
  },
  
  /**
   * Get the list of args for this function
   */
  checkFnArgEmptyText () {
    let fnList  = this.type == NodeCheckTypes.ready ? NodeReadyCheckFns : NodeValidCheckFns,
        checkFn = fnList[ this.checkFn ];
    if (checkFn && checkFn.args && checkFn.args.length) {
      //console.log("checkFnArgEmptyText: ", checkFn.args[0].label);
      return checkFn.args[ 0 ].label
    }
  }
});

/**
 * Template Event Handlers
 */
Template.NodeCheckEditList.events({
  "edited .editable"(e, instance, newValue){
    e.stopImmediatePropagation();
    let target             = $(e.target),
        checkId            = target.closest(".sortable-table-row").attr("data-pk"),
        dataKey            = target.attr("data-key"),
        update             = { $set: {} };
    update.$set[ dataKey ] = newValue;
    console.log("Edited: ", checkId, dataKey, newValue, update);
    
    if (checkId && dataKey) {
      NodeChecks.update({ _id: checkId }, update, (error) => {
        if (error) {
          RobaDialog.error("Update failed: " + error.toString());
        }
      });
    }
  },
  "click .btn-delete"(e, instance){
    let target  = $(e.target),
        checkId = target.closest(".sortable-table-row").attr("data-pk");
    
    RobaDialog.ask("Delete Server?", "Are you sure that you want to delete this check?", () => {
          NodeChecks.remove(checkId, function (error, response) {
            RobaDialog.hide();
            if (error) {
              RobaDialog.error("Delete failed: " + error.message);
            }
          });
        }
    );
    
  }
});

/**
 * Template Created
 */
Template.NodeCheckEditList.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.NodeCheckEditList.onRendered(() => {
  let instance = Template.instance();
  
  // Setup the sortable table
  instance.$(".sortable-table")
      .sortable({
        items               : "> .sortable-table-row",
        handle              : ".drag-handle",
        helper(e, ui) {
          // fix the width
          ui.children().each(function () {
            $(this).width($(this).width());
          });
          return ui;
        },
        axis                : "y",
        forcePlaceholderSize: true,
        update(event, ui) {
          var order;
          instance.$(".sortable-table-row").each(function (i, el) {
            order = $(el).attr("data-sort-order");
            if (order != i) {
              console.log("Updating order: ", i, $(el).attr("data-pk"));
              NodeChecks.update($(el).attr("data-pk"), { $set: { order: i } }, function (error, response) {
                if (error) {
                  RobaDialog.error("Order update failed: " + error.message);
                }
              });
            }
          });
        }
      })
      .disableSelection();
  
  // Make sure items added to the list are sortable
  instance.autorun(function () {
    let data       = Template.currentData(),
        nodeChecks = NodeChecks.find({
          parentId        : data.node.staticId,
          projectVersionId: data.node.projectVersionId,
          type            : data.type
        });
    instance.$(".sortable-table").sortable("refresh");
  });
  
});

/**
 * Template Destroyed
 */
Template.NodeCheckEditList.onDestroyed(() => {
  
});
