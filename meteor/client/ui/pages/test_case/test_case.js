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
    var dataKey    = $(e.target).attr("data-key"),
        update     = { $set: {} },
        testCaseId = instance.data._id;
    
    if (dataKey) {
      if (dataKey == "title-description") {
        update[ "$set" ].title       = newValue.title;
        update[ "$set" ].description = newValue.description;
      } else {
        update[ "$set" ][ dataKey ] = newValue;
      }
      
      TestCases.update(testCaseId, update, function (error) {
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
    var testCase = instance.data,
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
  var instance = Template.instance(),
      testCase = Template.currentData();
  
  // subscribe to the data
  if (testCase) {
    instance.testCaseId    = testCase.staticId;
    instance.subscriptions = {
      roles: instance.subscribe("test_case_roles", testCase.projectId, testCase.projectVersionId, testCase.staticId),
      steps: instance.subscribe("test_case_steps", testCase.projectId, testCase.projectVersionId, testCase.staticId)
    };
  }
  
  // setup a function to align the wait step_types
  instance.alignWaitSteps = function (waitId) {
    // get the elements at play
    var stepList = instance.$(".droppable-wait[data-wait-id='" + waitId + "']").closest(".test-case-step-body"),
        alignY   = 0;
    
    if (stepList.length > 1) {
      // get the alignment point
      var adjustmentList = [];
      stepList.each(function (i, el) {
        var stepEl     = $(el),
            stepOffset = stepEl.offset(),
            stepHeight = stepEl.height(),
            inflator   = stepEl.find(".wait-inflator"),
            inflation  = inflator.height(),
            stepFloor  = stepOffset.top + (stepHeight - inflation);
        
        alignY = stepFloor > alignY ? stepFloor : alignY;
        
        adjustmentList.push({
          inflator: inflator,
          floor   : stepFloor
        });
      });
      
      _.each(adjustmentList, function (step) {
        step.inflator.height(Math.max(alignY - step.floor, 0) + "px");
      });
    } else {
      // clean up the waitId
      var stepId = stepList.find(".draggable-wait").attr("data-step-id");
      TestCaseSteps.update(stepId, { $unset: { "data.waitId": true } }, function (error) {
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
    instance.updateTimeout = setTimeout(function () {
      //console.log("updateAlignment");
      var waitIds = _.uniq(TestCaseSteps.find({
        testCaseId   : instance.data.staticId,
        type         : TestCaseStepTypes.wait,
        "data.waitId": { $exists: true }
      }).map(function (step) {
        return step.data.waitId
      }));
      //console.log("waitIds: ", waitIds)
      
      // clean up the inflation of step_types without waitIds
      instance.$(".wait-inflator:not([data-wait-id])").height("0px");
      
      // clean up each of the waitIds
      _.each(waitIds, function (waitId) {
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
  instance.autorun(function () {
    //console.log("Test Case autorun");
    let data = Template.currentData();
    
    // check for a new testCaseId
    if (data.staticId !== instance.testCaseId) {
      //console.log("TestCaseId changed, updating subscriptions");
      instance.testCaseId = data.staticId;
      instance.subscriptions.roles.stop();
      instance.subscriptions.steps.stop();
      instance.subscriptions = {
        roles: instance.subscribe("test_case_roles", data.projectId, data.projectVersionId, data.staticId),
        steps: instance.subscribe("test_case_steps", data.projectId, data.projectVersionId, data.staticId)
      };
    }
    
    if (instance.testCaseObserver) {
      instance.testCaseObserver.stop();
    }
    
    instance.testCaseObserver = TestCaseSteps.find({ testCaseId: data.staticId }).observe({
      added(doc) {
        //console.log("Test case step added: ", doc._id);
        instance.updateAlignment();
      },
      removed() {
        //console.log("Test case step removed");
        instance.updateAlignment();
      },
      changed() {
        //console.log("Test case step changed");
        instance.updateAlignment();
      }
    });
    
    // kick off the alignment
    setTimeout(instance.updateAlignment, 750);
  });
};

/**
 * Template Destroyed
 */
Template.TestCase.destroyed = function () {
  
};
