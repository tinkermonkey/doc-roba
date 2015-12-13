/**
 * Template Helpers
 */
Template.TestRunTemplateList.helpers({
  testRunTemplates: function () {
    return Collections.TestRunTemplates.find({ projectVersionId: this.version._id}, { sort: { title: 1 } });
  }
});

/**
 * Template Event Handlers
 */
Template.TestRunTemplateList.events({
  "keyup .add-item-form input": function (e, instance) {
    var value = $(e.target).val();

    if(e.which == 13 && value.length){
      instance.$(".add-item-form .dropdown-toggle").trigger("click");
    } else if(value.length){
      if(instance.$(".add-item-form button").attr("disabled")){
        instance.$(".add-item-form button").removeAttr("disabled");
      }
    } else {
      instance.$(".add-item-form button").attr("disabled", "disabled");
    }
  },
  "click .add-item-form a": function (e, instance) {
    var itemType = $(e.target).closest("a").attr("data-name"),
      itemName = $(".add-item-form input").val().trim(),
      version = instance.data.version;

    if(itemType && itemName && itemName.length){
      Collections.TestRunTemplates.insert({
        projectId: version.projectId,
        projectVersionId: version._id,
        title: itemName
      }, function (error, result) {
        if(error){
          Meteor.log.error("Failed to insert test run template: " + error.message);
          Dialog.error("Failed to insert test run template: " + error.message);
        } else {
          $(".add-item-form input").val("")
        }
      });
    }
  },
  "click .test-run-template-list-item": function (e, instance) {
    var selectable = $(e.target).closest(".test-run-template-list-item");
    instance.$(".test-run-template-list-item.selected").removeClass("selected");
    selectable.addClass("selected");

    Router.query({testRunTemplateId: selectable.attr("data-pk")});
  }
});

/**
 * Template Created
 */
Template.TestRunTemplateList.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestRunTemplateList.rendered = function () {
  var instance = Template.instance();
  console.log("Selected template: ", instance.data);

  // make all of the test case list elements draggable
  instance.$(".test-run-template-list-item").draggable({
    revert: "invalid",
    distance: 5,
    helper: "clone",
    connectToSortable: ".test-run-item-list",
    start: function (event, ui) {
      ui.helper.addClass("in-drag");
    },
    stop: function (event, ui) {
      ui.helper.removeClass("in-drag");
    }
  });

  // Select the selected item if there is one defined
  if(instance.data.testRunTemplateId){
    console.log("Selected template: ", instance.data.testRunTemplateId);
    var testRunItem = instance.$(".test-run-template-list-item[data-pk='" + instance.data.testRunTemplateId + "']");
    testRunItem.addClass("selected");
  }

};

/**
 * Template Destroyed
 */
Template.TestRunTemplateList.destroyed = function () {
  
};
