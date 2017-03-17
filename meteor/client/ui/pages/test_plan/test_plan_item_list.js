import './test_plan_item_list.html';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { TestPlanItems } from '../../../../imports/api/test_plans/test_plan_items.js';
import { TestRunItemTypes, TestRunItemTypesLookup } from '../../../../imports/api/test_runs/test_run_item_types.js';
import './test_plan_item.js';

/**
 * Template Helpers
 */
Template.TestPlanItemList.helpers({
  hasItems () {
    return TestPlanItems.find({ parentId: this.staticId, projectVersionId: this.projectVersionId }).count();
  },
  testPlanItems () {
    return TestPlanItems.find({
      parentId        : this.staticId,
      projectVersionId: this.projectVersionId
    }, { sort: { order: 1 } });
  }
});

/**
 * Template Event Handlers
 */
Template.TestPlanItemList.events({
  "click .test-plan-item-delete" (e, instance) {
    e.stopImmediatePropagation();
    var item = this;
    
    if (item) {
      instance.deleteItem(item);
    }
  }
});

/**
 * Template Created
 */
Template.TestPlanItemList.onCreated(() => {
  let instance = Template.instance();
  
  // Reorder items in this immediate list
  instance.reorderItems = function () {
    // don't pick up the sub-lists
    $(instance.firstNode).children(".test-plan-item").each(function (i, el) {
      var newOrder = i + 1,
          oldOrder = parseFloat($(el).attr("data-order")),
          itemId   = $(el).attr("data-pk");
      if (newOrder != oldOrder) {
        TestPlanItems.update(itemId, { $set: { order: newOrder } }, function (error, response) {
          if (error) {
            RobaDialog.error("Test Run Item order update failed: " + error.message);
          }
        });
      }
    });
  };
  
  // Recursively delete items
  instance.deleteItem = function (item) {
    // delete the children first
    TestPlanItems.find({ parentId: item.staticId }).forEach(function (child) {
      console.log("Removing test run item child: ", child._id, TestRunItemTypesLookup[ child.type ]);
      instance.deleteItem(child);
    });
    
    // then delete the record
    console.log("Removing test run item: ", item._id, TestRunItemTypesLookup[ item.type ]);
    TestPlanItems.remove(item._id, function (error) {
      if (error) {
        RobaDialog.error("Failed to delete test run item: " + error.message);
      } else {
        instance.reorderItems();
      }
    });
  };
  
  // Accept a new item not from a test-plan-item-list
  instance.acceptNewItem = function (event, ui) {
    var newItem,
        data       = instance.data,
        testPlanId = ui.helper.closest(".test-plan-item-container").attr("data-test-plan-id"),
        parentId   = ui.helper.closest(".test-plan-item-list").attr("data-parent-id");
    
    // Add new items
    if (ui.sender.hasClass("test-plan-list-item")) {
      testPlanId = ui.sender.attr("data-test-plan-id");
      if (testPlanId) {
        newItem = {
          projectId       : data.projectId,
          projectVersionId: data.projectVersionId,
          testPlanId      : testPlanId,
          parentId        : parentId,
          type            : TestRunItemTypes.template,
          config          : {
            testPlanId: testPlanId
          }
        };
      }
    } else if (ui.sender.hasClass("center-pole-list-item")) {
      let testCaseId = ui.sender.attr("data-staticId");
      if (testCaseId) {
        newItem = {
          projectId       : data.projectId,
          projectVersionId: data.projectVersionId,
          testPlanId      : testPlanId,
          parentId        : parentId,
          type            : TestRunItemTypes.test,
          config          : {
            testCaseId: testCaseId
          }
        };
      }
    } else if (ui.sender.hasClass("center-pole-list-group")) {
      let testGroupId = ui.sender.attr("data-group-id");
      if (testGroupId) {
        newItem = {
          projectId       : data.projectId,
          projectVersionId: data.projectVersionId,
          testPlanId      : testPlanId,
          parentId        : parentId,
          type            : TestRunItemTypes.testGroup,
          config          : {
            testGroupId: testGroupId
          }
        };
      }
    } else if (ui.sender.hasClass("test-plan-new-item")) {
      let itemType = ui.sender.attr("data-type");
      if (itemType) {
        newItem = {
          projectId       : data.projectId,
          projectVersionId: data.projectVersionId,
          testPlanId      : testPlanId,
          parentId        : parentId,
          type            : itemType,
          config          : {}
        };
      }
    } else {
      console.log("Unknown Drop: ", ui);
    }
    
    if (newItem) {
      // pick up the new order
      var lastOrder = ui.helper.prev().attr("data-order") || 0;
      newItem.order = parseInt(lastOrder) + 0.1;
      
      // create the record
      TestPlanItems.insert(newItem, function (error) {
        if (error) {
          RobaDialog.error("Test Run Item insert failed: " + error.message);
        } else {
          instance.reorderItems();
        }
      });
    }
    
    // Don't need the helper because the record will get rendered
    ui.helper.remove();
  }
});

/**
 * Template Rendered
 */
Template.TestPlanItemList.onRendered(() => {
  let instance = Template.instance();
  instance.$("> .test-plan-item-list").sortable({
    forcePlaceholderSize: true,
    placeholder         : "test-plan-item-list-placeholder",
    items               : ">div:not(.alert)",
    connectWith         : ".test-plan-item-list",
    update (event, ui) {
      instance.reorderItems();
    },
    receive (event, ui) {
      // items from foreign sources have helpers
      if (ui.helper) {
        instance.acceptNewItem(event, ui);
      } else if (ui.item && ui.item.hasClass("test-plan-item")) {
        var itemId   = ui.item.attr("data-pk"),
            parentId = ui.item.closest(".test-plan-item-list").attr("data-parent-id"),
            newOrder = parseInt(ui.item.prev().attr("data-order") || 0) + 0.1;
        TestPlanItems.update(itemId, { $set: { parentId: parentId, order: newOrder } }, function (error) {
          if (error) {
            RobaDialog.error("Test Run Item update failed: " + error.message);
          } else {
            instance.reorderItems();
          }
        });
        
      }
    }
  });
});

/**
 * Template Destroyed
 */
Template.TestPlanItemList.onDestroyed(() => {
  
});
