/**
 * Template Helpers
 */
Template.TestCaseListGroup.helpers({
  isExpanded: function () {
    return Template.instance().expanded.get();
  },
  getGroups: function () {
    if(this.staticId){ // Newly created groups will not have a static ID causing uncontrolled recursion
      return TestGroups.find({ parentGroupId: this.staticId, projectVersionId: this.projectVersionId }, { sort: { title: 1 } });
    }
  },
  getTestCases: function () {
    return TestCases.find({ testGroupId: this.staticId, projectVersionId: this.projectVersionId }, { sort: { title: 1 } });
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseListGroup.events({
  "dblclick .test-case-list-group": function (e, instance) {
    e.stopPropagation();
    instance.expanded.set(!instance.expanded.get());
  }
});

/**
 * Template Created
 */
Template.TestCaseListGroup.created = function () {
  var instance = Template.instance();
  instance.expanded = new ReactiveVar(false);
};

/**
 * Template Rendered
 */
Template.TestCaseListGroup.rendered = function () {
  var instance = Template.instance();

  // make this draggable
  instance.$(".test-case-list-selectable").draggable({
    revert: "invalid",
    axis: "y",
    distance: 5,
    start: function (event, ui) {
      ui.helper.addClass("in-drag");
    },
    stop: function (event, ui) {
      ui.helper.removeClass("in-drag");
    }
  });

  // make this droppable
  instance.$(".test-case-list-group").droppable({
    greedy: true,
    hoverClass: "test-case-list-drop-hover",
    drop: function( event, ui ) {
      var groupId = $(this).attr("data-group-id"),
        itemId = ui.draggable.attr("data-pk"),
        itemIsGroup = ui.draggable.hasClass("test-case-list-group");
      console.log("Drop: ", itemId, "on", groupId);
      if(groupId && itemId){
        if(itemIsGroup){
          TestGroups.update(itemId, {$set: {parentGroupId: groupId}}, function (error) {
            if(error){
              Meteor.log.error("Failed to update parent group: " + error.message);
              Dialog.error("Failed to update parent group: " + error.message);
            }
          });
        } else {
          TestCases.update(itemId, {$set: {testGroupId: groupId}}, function (error) {
            if(error){
              Meteor.log.error("Failed to update test group: " + error.message);
              Dialog.error("Failed to update test group: " + error.message);
            }
          });
        }
      }
    },
    accept: function (el) {
      return $(el).attr("data-parent-id") !== $(this).attr("data-group-id");
    }
  });
};

/**
 * Template Destroyed
 */
Template.TestCaseListGroup.destroyed = function () {
  
};
