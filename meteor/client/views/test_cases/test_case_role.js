/**
 * Template Helpers
 */
Template.TestCaseRole.helpers({
  testCaseSteps: function () {
    return TestCaseSteps.find({testCaseRoleId: this.staticId}, {sort: {order: 1}});
  },
  hasSteps: function () {
    return TestCaseSteps.find({testCaseRoleId: this.staticId}, {sort: {order: 1}}).count() > 0;
  },
  TestCaseStepTypes: function () {
    return TestCaseStepTypes;
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseRole.events({
  "edited .editable": function (e, instance, newValue) {
    e.stopImmediatePropagation();
    var dataKey = $(e.target).attr("data-key"),
      update = {$set: {}},
      testCaseRoleId = instance.data._id;

    console.log("update: ", dataKey, testCaseRoleId);
    if(dataKey){
      update["$set"][dataKey] = newValue;
      console.log("Updating test case role record: ", dataKey, newValue, update);
      TestCaseRoles.update(testCaseRoleId, update, function (error) {
        if(error){
          Meteor.log.error("Failed to update test case role value: " + error.message);
          console.log(update);
          Dialog.error("Failed to update test case role value: " + error.message);
        }
      });
    } else {
      Meteor.log.error("Failed to update test case role value: data-key not found");
      Dialog.error("Failed to update test case role value: data-key not found");
    }
  },
  "click .btn-add-step": function (e, instance) {
    var testCaseRole = this,
      order = TestCaseSteps.find({testCaseRoleId: testCaseRole.staticId }).count(),
      type = $(e.target).closest("button").attr("data-type");
    console.log("Add Step: ", e.target, order, type);
    if(type && testCaseRole){
      TestCaseSteps.insert({
        projectId: testCaseRole.projectId,
        projectVersionId: testCaseRole.projectVersionId,
        testCaseId: testCaseRole.testCaseId,
        testCaseRoleId: testCaseRole.staticId,
        type: type,
        order: order
      });
    } else {
      Meteor.log.error("Could not add step: ", type, testCaseRole, order);
    }
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
  var instance = this;

  // make the steps sortable
  instance.$(".test-role-steps").sortable({
    axis: "y",
    distance: 5,
    handle: ".test-case-step-title",
    placeholder: "test-case-step-placeholder",
    forcePlaceholderSize: true
  }).disableSelection();

  // Listen for changes and refresh the sortable
  TestCaseSteps.find({testCaseRoleId: instance.data.staticId}).observeChanges({
    added: function () {
      console.log("Step added, refreshing sortables");
      instance.$(".test-case-step-container").sortable("refresh");
    }
  });
};

/**
 * Template Destroyed
 */
Template.TestCaseRole.destroyed = function () {
  
};
