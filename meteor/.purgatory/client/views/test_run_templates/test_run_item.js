/**
 * Template Helpers
 */
Template.TestRunItem.helpers({
  getItemIcon: function () {
    switch (this.type) {
      case TestRunItemTypes.stage:
        return "glyphicon-th-large";
      case TestRunItemTypes.template:
        return "glyphicon-list-alt";
      case TestRunItemTypes.test:
        return "glyphicon-ok-circle";
      case TestRunItemTypes.testGroup:
        return "glyphicon-folder-close";
    }
  },
  getItemTemplate: function () {
    switch (this.type) {
      case TestRunItemTypes.stage:
        return "TestRunItemStage";
      case TestRunItemTypes.template:
        return "TestRunItemTemplate";
      case TestRunItemTypes.test:
        return "TestRunItemTestCase";
      case TestRunItemTypes.testGroup:
        return "TestRunItemTestGroup";
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestRunItem.events({
  "edited .editable": function (e, instance, newValue) {
    e.stopImmediatePropagation();
    var dataKey = $(e.target).attr("data-key"),
      update = {$set: {}},
      itemId = instance.data._id;

    if(dataKey){
      if(dataKey == "title-description"){
        update["$set"].title = newValue.title;
        update["$set"].description = newValue.description;
      } else {
        update["$set"][dataKey] = newValue;
      }

      Collections.TestRunTemplateItems.update(itemId, update, function (error) {
        if(error){
          console.error("Failed to update test run template item value: " + error.message);
          console.log(update);
          Dialog.error("Failed to update test run template item value: " + error.message);
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
Template.TestRunItem.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestRunItem.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestRunItem.destroyed = function () {
  
};
