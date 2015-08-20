/**
 * Template Helpers
 */
Template.TestRunTemplate.helpers({});

/**
 * Template Event Handlers
 */
Template.TestRunTemplate.events({
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

      TestRunTemplates.update(templateId, update, function (error) {
        if(error){
          Meteor.log.error("Failed to update test run template value: " + error.message);
          console.log(update);
          Dialog.error("Failed to update test run template value: " + error.message);
        }
      });
    } else {
      Meteor.log.error("Failed to update test run template value: data-key not found");
      Dialog.error("Failed to update test run template value: data-key not found");
    }
  }
});

/**
 * Template Created
 */
Template.TestRunTemplate.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestRunTemplate.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestRunTemplate.destroyed = function () {
  
};
