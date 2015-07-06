/**
 * Template Helpers
 */
Template.TestCase.helpers({
  testCaseRoles: function () {
    return TestCaseRoles.find({testCaseId: this.staticId });
  },
  hasRoles: function () {
    return TestCaseRoles.find({testCaseId: this.staticId }).count() > 0;
  }
});

/**
 * Template Event Handlers
 */
Template.TestCase.events({
  "edited .editable": function (e, instance, newValue) {
    e.stopImmediatePropagation();
    var dataKey = $(e.target).attr("data-key"),
      update = {$set: {}},
      testCaseId = instance.data._id;

    console.log("update: ", dataKey, testCaseId);
    if(dataKey){
      update["$set"][dataKey] = newValue;
      console.log("Updating test case record: ", dataKey, newValue, update);
      TestCases.update(testCaseId, update, function (error) {
        if(error){
          Meteor.log.error("Failed to update test case value: " + error.message);
          console.log(update);
          Dialog.error("Failed to update test case value: " + error.message);
        }
      });
    } else {
      Meteor.log.error("Failed to update test case value: data-key not found");
      Dialog.error("Failed to update test case value: data-key not found");
    }
  },
  "click .btn-add-role": function (e, instance) {
    var testCase = instance.data,
      order = TestCaseRoles.find({testCaseId: testCase.staticId }).count();
    TestCaseRoles.insert({
      projectId: testCase.projectId,
      projectVersionId: testCase.projectVersionId,
      testCaseId: testCase.staticId,
      order: order,
      title: "Test Role"
    });
  }
});

/**
 * Template Created
 */
Template.TestCase.created = function () {
  var instance = this;
  var testCase = Template.currentData();
  if(testCase){
    instance.subscribe("test_case_roles", testCase.projectId, testCase.projectVersionId, testCase.staticId);
    instance.subscribe("test_case_steps", testCase.projectId, testCase.projectVersionId, testCase.staticId);
  }
};

/**
 * Template Rendered
 */
Template.TestCase.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestCase.destroyed = function () {
  
};
