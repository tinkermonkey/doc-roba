import './test_plan_item.html';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { TestPlanItems } from '../../../../imports/api/test_plan/test_plan_item.js';
import { TestRunItemTypes } from '../../../../imports/api/test_run/test_run_item_types.js';
import './test_plan_items/test_plan_item_stage.js';
import './test_plan_items/test_plan_item_template.js';
import './test_plan_items/test_plan_item_test_case.js';
import './test_plan_items/test_plan_item_test_group.js';

/**
 * Template Helpers
 */
Template.TestPlanItem.helpers({
  getItemIcon () {
    switch (this.type) {
      case TestRunItemTypes.stage:
        return "glyphicon-th-large";
      case TestRunItemTypes.template:
        return "glyphicon-list-alt";
      case TestRunItemTypes.test:
        return "glyphicon-ok-circle";
      case TestRunItemTypes.testGroup:
        return "glyphicon-folder-close";
    }
  },
  getItemTemplate () {
    switch (this.type) {
      case TestRunItemTypes.stage:
        return "TestPlanItemStage";
      case TestRunItemTypes.template:
        return "TestPlanItemTemplate";
      case TestRunItemTypes.test:
        return "TestPlanItemTestCase";
      case TestRunItemTypes.testGroup:
        return "TestPlanItemTestGroup";
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestPlanItem.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    var dataKey = $(e.target).attr("data-key"),
        update  = { $set: {} },
        itemId  = instance.data._id;
    
    if (dataKey) {
      if (dataKey == "title-description") {
        update[ "$set" ].title       = newValue.title;
        update[ "$set" ].description = newValue.description;
      } else {
        update[ "$set" ][ dataKey ] = newValue;
      }
      
      TestPlanItems.update(itemId, update, function (error) {
        if (error) {
          RobaDialog.error("Failed to update test run template item value: " + error.message);
          console.error("Failed update:", update);
        }
      });
    } else {
      RobaDialog.error("Failed to update test run template value: data-key not found");
    }
  },
  /**
   * JS hover required to only highlight the inner-most container being hovered
   * @param e
   * @param instance
   */
  "mouseenter .test-plan-item"(e, instance){
    $(".test-plan-item-hover").removeClass("test-plan-item-hover");
    $(e.target).addClass("test-plan-item-hover");
  },
  "mouseleave .test-plan-item-hover"(e, instance){
    $(e.target).removeClass("test-plan-item-hover");
    $(e.target).parent().closest(".test-plan-item").addClass("test-plan-item-hover");
  }
});

/**
 * Template Created
 */
Template.TestPlanItem.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.TestPlanItem.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TestPlanItem.onDestroyed(() => {
  
});
