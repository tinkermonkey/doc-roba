import './test_case.html';
import './test_case.css';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { TestCaseStepTypes } from '../../../../imports/api/test_cases/test_case_step_types.js';
import { TestCases } from '../../../../imports/api/test_cases/test_cases.js';
import { TestCaseRoles } from '../../../../imports/api/test_cases/test_case_roles.js';
import { TestCaseSteps } from '../../../../imports/api/test_cases/test_case_steps.js';
import './test_case_recent_result_list.js';
import './test_case_launcher.js';
import './test_case_role.js';

/**
 * Template Helpers
 */
Template.TestCase.helpers({});

/**
 * Template Event Handlers
 */
Template.TestCase.events({
  "edited .editable"(e, instance, newValue) {
    e.stopImmediatePropagation();
    let dataKey    = $(e.target).attr("data-key"),
        update     = { $set: {} },
        testCaseId = instance.data._id;
    
    if (dataKey) {
      update[ "$set" ][ dataKey ] = newValue;
      
      TestCases.update(testCaseId, update, (error) => {
        if (error) {
          console.error("Failed to update test case value: " + error.message);
          console.log(update);
          RobaDialog.error("Failed to update test case value: " + error.message);
        }
      });
    } else {
      console.error("Failed to update test case value: data-key not found");
      RobaDialog.error("Failed to update test case value: data-key not found");
    }
  },
  "click .btn-add-role"(e, instance) {
    let testCase = instance.data,
        order    = testCase.roles().count();
    TestCaseRoles.insert({
      projectId       : testCase.projectId,
      projectVersionId: testCase.projectVersionId,
      testCaseId      : testCase.staticId,
      order           : order,
      title           : "New Role"
    });
  }
});

/**
 * Template Created
 */
Template.TestCase.created = function () {
  let instance = Template.instance();
  
  // subscribe to the data
  instance.autorun(() => {
    let testCase = Template.currentData();
    if (testCase && testCase.staticId) {
      instance.subscribe("test_case_roles", testCase.projectId, testCase.projectVersionId, testCase.staticId);
      instance.subscribe("test_case_steps", testCase.projectId, testCase.projectVersionId, testCase.staticId);
    }
  });
  
  // setup a function to align the wait step_types
  instance.alignWaitSteps = function (waitId) {
    // get the elements at play
    let stepList = instance.$(".droppable-wait[data-wait-id='" + waitId + "']").closest(".roba-round-container"),
        alignY   = 0;
    
    if (stepList.length > 1) {
      // get the alignment point
      let adjustmentList = [];
      stepList.each((i, el) => {
        let stepEl         = $(el),
            stepOffset     = stepEl.offset(),
            stepHeight     = stepEl.height(),
            stepBody       = stepEl.find(".test-case-step-body"),
            originalHeight = stepEl.attr('data-original-height') ? parseInt(stepEl.attr('data-original-height')) : stepHeight,
            stepFloor      = stepOffset.top + originalHeight;
        
        //console.log('Align:', stepOffset.top, '+', originalHeight, '=', stepOffset.top + originalHeight);
        
        alignY = stepFloor > alignY ? stepFloor : alignY;
        
        adjustmentList.push({
          el    : stepEl,
          body  : stepBody,
          floor : stepFloor,
          height: originalHeight
        });
      });
      
      adjustmentList.forEach((step) => {
        let adjustment = alignY - step.floor,
            bodyHeight = step.height,
            margin     = step.el.height() - step.body.height(),
            newHeight  = bodyHeight + adjustment - margin;
        
        //console.log('Inflating: alignY', alignY, 'step.floor', step.floor, 'adjustment', adjustment, 'bodyHeight', bodyHeight, 'newHeight', newHeight);
        if (!step.el.attr('data-original-height')) {
          //console.log('Setting the original height:', step.el.height());
          step.el.attr('data-original-height', step.el.height());
        }
        
        step.body.height(newHeight);
      });
    } else {
      // clean up the waitId
      let stepId = stepList.find(".draggable-wait").attr("data-step-id");
      TestCaseSteps.update(stepId, { $unset: { "data.waitId": true } }, (error) => {
        if (error) {
          console.error("Failed to update step: " + error.message);
          RobaDialog.error("Failed to update step: " + error.message);
        }
      });
    }
  };
  
  // umbrella function for maintaining the wait step_types
  instance.updateAlignment = function () {
    // buffer the requests to prevent thrashing
    if (instance.updateTimeout) {
      clearTimeout(instance.updateTimeout);
    }
    instance.updateTimeout = setTimeout(() => {
      //console.log("updateAlignment:", instance.data);
      let testCase = instance.data,
          waitIds  = _.uniq(TestCaseSteps.find({
            testCaseId   : testCase.staticId,
            type         : TestCaseStepTypes.wait,
            "data.waitId": { $exists: true }
          }).map((step) => {
            return step.data.waitId
          }));
      
      // clean up each of the waitIds
      _.each(waitIds, (waitId) => {
        instance.alignWaitSteps(waitId);
      });
    }, 250);
  };
};

/**
 * Template Rendered
 */
Template.TestCase.rendered = function () {
  let instance = Template.instance();
  
  // monitor test case step changes to maintain wait alignment
  instance.autorun(() => {
    console.log("Test Case autorun");
    let testCase = Template.currentData();
    
    if (testCase.staticId !== instance.observedTestCaseId) {
      // Keep track of the test case we have observers for so we only reset them if needed
      instance.observedTestCaseId = testCase.staticId;
      
      if (instance.testCaseObserver) {
        instance.testCaseObserver.stop();
      }
      
      // When the underlying steps are updated, redo the step alignment
      instance.testCaseObserver = TestCaseSteps.find({ testCaseId: testCase.staticId }).observe({
        added(doc) {
          console.log("Test case step added: ", doc._id);
          instance.updateAlignment();
        },
        removed() {
          console.log("Test case step removed");
          instance.updateAlignment();
        },
        changed() {
          console.log("Test case step changed");
          instance.updateAlignment();
        }
      });
    }
  });
};

/**
 * Template Destroyed
 */
Template.TestCase.destroyed = function () {
  
};
