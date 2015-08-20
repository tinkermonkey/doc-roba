/**
 * Template Helpers
 */
Template.TestRunTemplateList.helpers({
  testRunTemplates: function () {
    return TestRunTemplates.find({ projectVersionId: this.version._id}, { sort: { title: 1 } });
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

    console.log("Add Item: ", itemType, itemName);

    if(itemType && itemName && itemName.length){
      TestRunTemplates.insert({
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
  "click .test-case-list-item": function (e, instance) {
    var selectable = $(e.target).closest(".test-case-list-item");
    instance.$(".test-case-list-item.selected").removeClass("selected");
    selectable.addClass("selected");

    $(".test-case-content").addClass("intro-slide-left");
    setTimeout(function () {
      instance.data.testRunTemplateId.set(selectable.attr("data-pk"));
      $(".test-case-content").removeClass("intro-slide-left");
    }, 500);
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

  // make all of the test case list elements draggable
  instance.$(".test-case-list-selectable").draggable({
    revert: "invalid"
  });
};

/**
 * Template Destroyed
 */
Template.TestRunTemplateList.destroyed = function () {
  
};
