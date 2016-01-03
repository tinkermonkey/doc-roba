/**
 * Template Helpers
 */
Template.TestCaseRecentResultList.helpers({
  results: function () {
    return Template.instance().results();
  },
  hasMoreResults: function () {
    var limit = Template.instance().limit.get();
    if(limit > 0){
      return Template.instance().results().count() >= Template.instance().limit.get();
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseRecentResultList.events({
  "click .test-result-row": function (e, instance) {
    var testResult = this;
    Router.go("test_result", {projectId: testResult.projectId, projectVersionId: testResult.projectVersionId, _id: testResult._id});
  }
});

/**
 * Template Created
 */
Template.TestCaseRecentResultList.created = function () {
  var instance = this;

  // initialize the reactive variables
  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(10);
  instance.roleSubs = {};
  //console.log("TestCaseRecentResults: ", instance.data.staticId);

  // setup the results data
  instance.results = function() {
    return Collections.TestResults.find({
      testCaseId: instance.data.staticId
    }, {
      sort: { dateCreated: -1 },
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

    if(subscription.ready()){
      if(limit > 0){
        instance.loaded.set(limit);
      } else {
        var count = Collections.TestResults.find({testCaseId: instance.data.staticId, projectVersionId: instance.data.projectVersionId}).count();
        //console.log("Limit:", limit, "Count:", count);
        instance.loaded.set(count);
      }

      // subscribe to the role results for each of the results
      Collections.TestResults.find({testCaseId: instance.data.staticId, projectVersionId: instance.data.projectVersionId})
        .forEach(function (result) {
          //console.log("Found test result: ", result);
          if(!instance.roleSubs[result._id]){
            //console.log("Subscribing to test result roles: ", result._id);
            instance.roleSubs[result._id] = instance.subscribe("test_result_roles", instance.data.projectId, result._id);
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
