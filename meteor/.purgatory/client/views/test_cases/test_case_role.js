/**
 * Template Helpers
 */
Template.TestCaseRole.helpers({
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

    if(dataKey){
      if(dataKey == "title-description"){
        update["$set"].title = newValue.title;
        update["$set"].description = newValue.description;
      } else {
        update["$set"][dataKey] = newValue;
      }

      TestCaseRoles.update(testCaseRoleId, update, function (error) {
        if(error){
          console.error("Failed to update test case role value: " + error.message);
          console.log(update);
          Dialog.error("Failed to update test case role value: " + error.message);
        }
      });
    } else {
      console.error("Failed to update test case role value: data-key not found");
      Dialog.error("Failed to update test case role value: data-key not found");
    }
  },
  "click .btn-add-step": function (e, instance) {
    var testCaseRole = this,
      order = TestCaseSteps.find({testCaseRoleId: testCaseRole.staticId }).count(),
      type = $(e.target).closest("button").attr("data-type");

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
      console.error("Could not add step: ", type, testCaseRole, order);
    }
  },
  "click .btn-delete-role": function (e, instance) {
    var testCaseRole = this;

    Dialog.show({
      title: "Delete Role?",
      text: "Are you sure you want to delete this Test Case Role?",
      width: 400,
      buttons: [
        {text: "Cancel"},
        {text: "Delete"}
      ],
      callback: function (btn) {
        //console.log("Dialog button pressed: ", btn);
        if(btn == "Delete"){
          // Call the delete function, needs to happen server side
          Meteor.call("deleteTestCaseRole", testCaseRole, function (error, result) {
            Dialog.hide();
            if(error) {
              console.error("Failed to delete role: " + error.message);
              Dialog.error("Failed to delete role: " + error.message);
            } else {
              console.debug("Role deleted: " + result);
            }
          });
        } else {
          Dialog.hide();
        }
      }
    });
  },
  "mousedown .test-case-step-title": function (e, instance) {
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
  var instance = this;

  // make the steps sortable
  instance.$(".test-role-steps").sortable({
    axis: "y",
    distance: 5,
    handle: ".test-case-step-title",
    placeholder: "test-case-step-placeholder",
    forcePlaceholderSize: true,
    update: function (event, ui) {
      // restore the flexible height of the list
      instance.$(".test-role-steps").height("auto");
      instance.$(".test-case-step").each(function (newOrder, el) {
        var step = $(el),
          stepId = step.attr("data-pk"),
          oldOrder = step.attr("data-order");

        if(oldOrder !== newOrder){
          TestCaseSteps.update(stepId, {$set: {order: newOrder}}, function (error, result) {
            if(error){
              console.error("Failed to update step order: " + error.message);
              Dialog.error("Failed to update step order: " + error.message);
            }
          });
        }
      });
    }
  }).disableSelection();

  // Listen for changes and refresh the sortable
  TestCaseSteps.find({testCaseRoleId: instance.data.staticId}).observeChanges({
    added: function () {
      instance.$(".test-role-steps").sortable("refresh");
    }
  });

  // Animate the addition of role steps
  /*
  instance.find(".test-role-steps")._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();
    },
    removeElement: function(node) {
      $(node).fadeOut(function() {
        $(node).remove();
      });
    }
  }
  */
};

/**
 * Template Destroyed
 */
Template.TestCaseRole.destroyed = function () {
  
};
