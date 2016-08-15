/**
 * Template Helpers
 */
Template.TestPlan.helpers({});

/**
 * Template Event Handlers
 */
Template.TestPlan.events({
  "edited .editable": function (e, instance, newValue) {
    e.stopImmediatePropagation();
    var dataKey = $(e.target).attr("data-key"),
      update = {$set: {}},
      templateId = instance.data._id;

    if(dataKey){
      if(dataKey == "title-description"){
        update["$set"].title = newValue.title;
        update["$set"].description = newValue.description;
      } else {
        update["$set"][dataKey] = newValue;
      }

      TestPlans.update(templateId, update, function (error) {
        if(error){
          console.error("Failed to update test run template value: " + error.message);
          console.log(update);
          Dialog.error("Failed to update test run template value: " + error.message);
        }
      });
    } else {
      console.error("Failed to update test run template value: data-key not found");
      Dialog.error("Failed to update test run template value: data-key not found");
    }
  }
});

/**
 * Template Created
 */
Template.TestPlan.created = function () {
};

/**
 * Template Rendered
 */
Template.TestPlan.rendered = function () {
  var instance = this;

  instance.$(".test-run-add-item-list > .test-run-new-item").draggable({
    revert: "invalid",
    distance: 5,
    connectToSortable: ".test-run-item-list",
    helper: "clone",
    start: function (event, ui) {
      ui.helper.addClass("in-drag");
    },
    stop: function (event, ui) {
      ui.helper.removeClass("in-drag");
    }
  });
};

/**
 * Template Destroyed
 */
Template.TestPlan.destroyed = function () {
  
};
