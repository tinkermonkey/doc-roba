import './test_case_role.html';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { TestCaseRoles } from '../../../../imports/api/test_cases/test_case_roles.js';
import { TestCaseSteps } from '../../../../imports/api/test_cases/test_case_steps.js';
import { TestCaseStepTypes } from '../../../../imports/api/test_cases/test_case_step_types.js';
import './test_case_step.js';

/**
 * Template Helpers
 */
Template.TestCaseRole.helpers({
  TestCaseStepTypes() {
    return TestCaseStepTypes;
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseRole.events({
  "edited .editable"(e, instance, newValue) {
    e.stopImmediatePropagation();
    let dataKey        = $(e.target).attr("data-key"),
        update         = { $set: {} },
        testCaseRoleId = instance.data._id;
    
    if (dataKey) {
      if (dataKey === "title-description") {
        update[ "$set" ].title       = newValue.title;
        update[ "$set" ].description = newValue.description;
      } else {
        update[ "$set" ][ dataKey ] = newValue;
      }
      
      TestCaseRoles.update(testCaseRoleId, update, function (error) {
        if (error) {
          console.error("Failed to update test case role value: " + error.message);
          console.log(update);
          RobaDialog.error("Failed to update test case role value: " + error.message);
        }
      });
    } else {
      console.error("Failed to update test case role value: data-key not found");
      RobaDialog.error("Failed to update test case role value: data-key not found");
    }
  },
  "click .btn-add-step"(e, instance) {
    let testCaseRole = this,
        order        = TestCaseSteps.find({ testCaseRoleId: testCaseRole.staticId }).count(),
        type         = $(e.target).closest("button").attr("data-type");
    
    if (type && testCaseRole) {
      TestCaseSteps.insert({
        projectId       : testCaseRole.projectId,
        projectVersionId: testCaseRole.projectVersionId,
        testCaseId      : testCaseRole.testCaseId,
        testCaseRoleId  : testCaseRole.staticId,
        type            : type,
        order           : order
      });
    } else {
      console.error("Could not add step: ", type, testCaseRole, order);
    }
  },
  "click .btn-delete-role"(e, instance) {
    let testCaseRole = this;
    
    RobaDialog.show({
      title  : "Delete Role?",
      text   : "Are you sure you want to delete this Test Case Role?",
      width  : 400,
      buttons: [
        { text: "Cancel" },
        { text: "Delete" }
      ],
      callback(btn) {
        //console.log("Dialog button pressed: ", btn);
        if (btn === "Delete") {
          // Call the delete function, needs to happen server side
          Meteor.call("deleteTestCaseRole", testCaseRole, function (error, result) {
            RobaDialog.hide();
            if (error) {
              console.error("Failed to delete role: " + error.message);
              RobaDialog.error("Failed to delete role: " + error.message);
            } else {
              console.debug("Role deleted: " + result);
            }
          });
        } else {
          RobaDialog.hide();
        }
      }
    });
  },
  "mousedown .test-case-step-title"(e, instance) {
    // because the page height is defined by this list, we need to pin it to prevent unwanted scrolling
    instance.$(".test-role-steps").height(instance.$(".test-role-steps").outerHeight());
  }
});

/**
 * Template Created
 */
Template.TestCaseRole.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestCaseRole.rendered = function () {
  let instance = Template.instance();
  
  // make the step_types sortable
  instance.$(".test-role-steps").sortable({
    axis                : "y",
    distance            : 5,
    handle              : ".roba-round-container-title",
    placeholder         : "test-case-step-placeholder",
    forcePlaceholderSize: true,
    update(event, ui) {
      console.log('TestCaseRole order update');
      
      // restore the flexible height of the list
      instance.$(".test-role-steps").height("auto");
      instance.$(".roba-round-container").each((newOrder, el) => {
        let step     = $(el),
            stepId   = step.attr("data-pk"),
            oldOrder = step.attr("data-order");
        
        console.log('TestCaseRole step re-order:', stepId, oldOrder, newOrder);
        if (oldOrder !== newOrder) {
          TestCaseSteps.update(stepId, { $set: { order: newOrder } }, function (error, result) {
            if (error) {
              console.error("Failed to update step order: " + error.message);
              RobaDialog.error("Failed to update step order: " + error.message);
            }
          });
        }
      });
    }
  }).disableSelection();
  
  // Listen for changes and refresh the sortable
  TestCaseSteps.find({ testCaseRoleId: instance.data.staticId }).observeChanges({
    added() {
      console.log('Added a step, refreshing sortable');
      instance.$(".test-role-steps").sortable("refresh");
    }
  });
};

/**
 * Template Destroyed
 */
Template.TestCaseRole.destroyed = function () {
  
};
