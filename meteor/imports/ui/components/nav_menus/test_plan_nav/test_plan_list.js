import './test_plan_list.html';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { TestPlans } from '../../../../api/test_plan/test_plan.js';
import './test_plan_list_item.js';

/**
 * Template Helpers
 */
Template.TestPlanList.helpers({
  testPlans () {
    return TestPlans.find({ projectVersionId: FlowRouter.getParam("projectVersionId") }, { sort: { title: 1 } });
  }
});

/**
 * Template Event Handlers
 */
Template.TestPlanList.events({
  "keyup .add-item-form input" (e, instance) {
    var value = $(e.target).val();
    
    if (e.which == 13 && value.length) {
      instance.$(".add-item-form .dropdown-toggle").trigger("click");
    } else if (value.length) {
      if (instance.$(".add-item-form button").attr("disabled")) {
        instance.$(".add-item-form button").removeAttr("disabled");
      }
    } else {
      instance.$(".add-item-form button").attr("disabled", "disabled");
    }
  },
  "click .add-item-form a" (e, instance) {
    var itemType  = $(e.target).closest("a").attr("data-name"),
        itemName  = $(".add-item-form input").val().trim(),
        projectId = FlowRouter.getParam("projectId"),
        versionId = FlowRouter.getParam("projectVersionId");
    
    if (itemType && itemName && itemName.length) {
      TestPlans.insert({
        projectId       : projectId,
        projectVersionId: versionId,
        title           : itemName
      }, function (error, result) {
        if (error) {
          RobaDialog.error("Failed to insert test run template: " + error.message);
        } else {
          $(".add-item-form input").val("")
        }
      });
    }
  },
  "click .test-case-list-item" (e, instance) {
    var selectable = $(e.target).closest(".test-case-list-item");
    instance.$(".test-case-list-item.selected").removeClass("selected");
    selectable.addClass("selected");
    FlowRouter.setQueryParams({ testPlanId: selectable.attr("data-pk") });
  }
});

/**
 * Template Created
 */
Template.TestPlanList.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(function () {
    var projectId        = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    
    instance.subscribe("test_plans", projectId, projectVersionId);
  });
});

/**
 * Template Rendered
 */
Template.TestPlanList.onRendered(() => {
  var instance = Template.instance();
  
  // make all of the test case list elements draggable
  instance.$(".test-case-list-item").draggable({
    revert           : "invalid",
    distance         : 5,
    helper           : "clone",
    connectToSortable: ".test-plan-item-list",
    start (event, ui) {
      ui.helper.addClass("in-drag");
    },
    stop (event, ui) {
      ui.helper.removeClass("in-drag");
    }
  });
  
  // Select the selected item if there is one defined
  var testPlanId = FlowRouter.getQueryParam("testPlanId");
  if (testPlanId) {
    //console.log("Selected template: ", testPlanId);
    var testRunItem = instance.$(".test-case-list-item[data-pk='" + testPlanId + "']");
    testRunItem.addClass("selected");
  }
  
});

/**
 * Template Destroyed
 */
Template.TestPlanList.onDestroyed(() => {
  
});
