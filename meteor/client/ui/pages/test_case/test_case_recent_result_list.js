import './test_case_recent_result_list.html';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { TestResults } from '../../../../imports/api/test_results/test_results.js';
import { TestResultCodes } from '../../../../imports/api/test_results/test_result_codes.js';

/**
 * Template Helpers
 */
Template.TestCaseRecentResultList.helpers({
  results() {
    return Template.instance().results();
  },
  hasMoreResults() {
    var limit = Template.instance().limit.get();
    if (limit > 0) {
      return Template.instance().results().count() >= Template.instance().limit.get();
    }
  },
  labelClass(){
    let result = this,
        labelClass = 'default';
    switch (result.resultCode) {
      case TestResultCodes.pass:
        labelClass = 'success';
        break;
      case TestResultCodes.fail:
        labelClass = 'danger';
        break;
      case TestResultCodes.warn:
        labelClass = 'warning';
        break;
    }
    return labelClass
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseRecentResultList.events({
  "click .test-result-row"(e, instance) {
    var testResult = this;
    FlowRouter.go("TestResult", {
      projectId       : testResult.projectId,
      projectVersionId: testResult.projectVersionId,
      testResultId    : testResult._id
    });
  }
});

/**
 * Template Created
 */
Template.TestCaseRecentResultList.created = function () {
  let instance = Template.instance();
  
  // initialize the reactive variables
  instance.loaded   = new ReactiveVar(0);
  instance.limit    = new ReactiveVar(10);
  instance.roleSubs = {};
  
  // subscribe to underlying rendering data
  instance.autorun(function () {
    instance.subscribe("test_servers", instance.data.projectId, instance.data.projectVersionId);
    instance.subscribe("test_systems", instance.data.projectId, instance.data.projectVersionId);
    instance.subscribe("test_agents", instance.data.projectId, instance.data.projectVersionId);
  });
  
  // setup the results data
  instance.results = function () {
    return TestResults.find({
      testCaseId: instance.data.staticId
    }, {
      sort : { dateCreated: -1 },
      limit: instance.loaded.get()
    });
  };
  
  // React to limit changes
  instance.autorun(function () {
    // grab the limit
    var limit = instance.limit.get();
    //console.log("Loading [", limit, "] results for ", instance.data.staticId);
    
    // Update the subscription
    var subscription = instance.subscribe("test_case_results", instance.data.projectId, instance.data.staticId, limit);
    
    if (subscription.ready()) {
      if (limit > 0) {
        instance.loaded.set(limit);
      } else {
        var count = TestResults.find({ testCaseId: instance.data.staticId, projectVersionId: instance.data.projectVersionId }).count();
        //console.log("Limit:", limit, "Count:", count);
        instance.loaded.set(count);
      }
      
      // subscribe to the role results for each of the results
      TestResults.find({ testCaseId: instance.data.staticId, projectVersionId: instance.data.projectVersionId })
          .forEach(function (result) {
            //console.log("Found test result: ", result);
            if (!instance.roleSubs[ result._id ]) {
              //console.log("Subscribing to test result roles: ", result._id);
              instance.roleSubs[ result._id ] = instance.subscribe("test_result_roles", instance.data.projectId, result._id);
            }
          });
    }
  });
};

/**
 * Template Rendered
 */
Template.TestCaseRecentResultList.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestCaseRecentResultList.destroyed = function () {
  
};
