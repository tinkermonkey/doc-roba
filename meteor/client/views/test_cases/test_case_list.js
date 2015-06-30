/**
 * Template Helpers
 */
Template.TestCaseList.helpers({
  getGroups: function () {
    return TestGroups.find({ parentGroupId: null }, { sort: { title: 1 } });
  },
  getTestCases: function () {
    return TestCases.find({ testGroupId: null }, { sort: { title: 1 } });
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseList.events({
  "keyup .add-item-form input": function (e, instance) {
    var value = $(e.target).val();
    console.log("keyup: ", value, e.which);

    if(e.which == 13 && value.length){
      instance.$(".add-item-form .dropdown-toggle").trigger("click");
    }
  },
  "click .add-item-form a": function (e, instance) {
    var itemType = $(e.target).attr("data-name"),
      itemName = $(".add-item-form input").val().trim(),
      version = instance.data.version,
      groupId = instance.$(".test-case-list-selectable.selected").attr("data-group-id");

    console.log("Add Item: ", itemType, itemName, groupId);

    if(itemType && itemName && itemName.length){
      if(itemType == "testcase"){
        TestCases.insert({
          projectId: version.projectId,
          projectVersionId: version._id,
          testGroupId: groupId,
          title: itemName
        }, function (error, result) {
          if(error){
            Meteor.log.error("Failed to insert test case: " + error.message);
            Dialog.error("Failed to insert test case: " + error.message);
          } else {
            $(".add-item-form input").val("")
          }
        });
      } else if(itemType == "testgroup") {
        TestGroups.insert({
          projectId: version.projectId,
          projectVersionId: version._id,
          parentGroupId: groupId,
          title: itemName
        }, function (error, result) {
          if(error){
            Meteor.log.error("Failed to insert test group: " + error.message);
            Dialog.error("Failed to insert test group: " + error.message);
          } else {
            $(".add-item-form input").val("")
          }
        });
      }
    }
  },
  "click .test-case-list-selectable": function (e, instance) {
    instance.$(".test-case-list-selectable.selected").removeClass("selected");
    $(e.target).closest(".test-case-list-selectable").addClass("selected");
  }
});

/**
 * Template Created
 */
Template.TestCaseList.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestCaseList.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestCaseList.destroyed = function () {
  
};
