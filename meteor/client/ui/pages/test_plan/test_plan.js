import './test_plan.html';
import './test_plan.css';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { TestPlans } from '../../../../imports/api/test_plan/test_plan.js';
import './test_plan_new_item.js';
import './test_plan_item_list.js';

/**
 * Template Helpers
 */
Template.TestPlan.helpers({});

/**
 * Template Event Handlers
 */
Template.TestPlan.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    var dataKey    = $(e.target).attr("data-key"),
        update     = { $set: {} },
        testPlanId = instance.data._id;
    
    if (dataKey) {
      if (dataKey == "title-description") {
        update[ "$set" ].title       = newValue.title;
        update[ "$set" ].description = newValue.description;
      } else {
        update[ "$set" ][ dataKey ] = newValue;
      }
      
      TestPlans.update(testPlanId, update, function (error) {
        if (error) {
          RobaDialog.error("Failed to update test run template value: " + error.message);
          console.log(update);
        }
      });
    } else {
      RobaDialog.error("Failed to update test run template value: data-key not found");
    }
  }
});

/**
 * Template Created
 */
Template.TestPlan.onCreated(() => {
});

/**
 * Template Rendered
 */
Template.TestPlan.onRendered(() => {
  let instance = Template.instance();
  
  instance.$(".test-plan-add-item-list > .test-plan-new-item").draggable({
    revert           : "invalid",
    distance         : 5,
    connectToSortable: ".test-plan-item-list",
    helper           : "clone",
    start (event, ui) {
      ui.helper.addClass("in-drag");
    },
    stop (event, ui) {
      ui.helper.removeClass("in-drag");
    }
  });
});

/**
 * Template Destroyed
 */
Template.TestPlan.onDestroyed(() => {
  
});
