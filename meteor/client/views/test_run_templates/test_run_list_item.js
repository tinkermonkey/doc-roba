/**
 * Template Helpers
 */
Template.TestRunListItem.helpers({
  isExpanded: function () {
    return Template.instance().expanded.get();
  },
  getSubRuns: function () {
    if(this.staticId){ // Newly created groups will not have a static ID causing uncontrolled recursion
      return TestRunTemplates.find({ parentTemplateId: this.staticId, projectVersionId: this.projectVersionId }, { sort: { title: 1 } });
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestRunListItem.events({
  "dblclick .test-case-list-group": function (e, instance) {
    e.stopImmediatePropagation();
    instance.expanded.set(!instance.expanded.get());
  }
});

/**
 * Template Created
 */
Template.TestRunListItem.created = function () {
  var instance = Template.instance();
  instance.expanded = new ReactiveVar(false);
};

/**
 * Template Rendered
 */
Template.TestRunListItem.rendered = function () {
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
      var newParentId = $(this).attr("data-template-id"),
        itemId = ui.draggable.attr("data-pk");
      console.log("Drop: ", itemId, "on", newParentId);
      if(newParentId && itemId){
        TestRunTemplates.update(itemId, {$set: {parentTemplateId: newParentId}}, function (error) {
          if(error){
            Meteor.log.error("Failed to update parent template: " + error.message);
            Dialog.error("Failed to update parent template: " + error.message);
          }
        });
      }
    },
    accept: function (el) {
      var dragParentId = $(el).attr("data-parent-id"),
        dragId = $(el).attr("data-template-id"),
        targetId = $(this).attr("data-template-id"),
        isChild = false;
      if(dragId){
        isChild = $(this).closest("[data-template-id='" + dragId + "']").length > 0;
      }
      return dragParentId !== targetId && !isChild;
    }
  });
};

/**
 * Template Destroyed
 */
Template.TestRunListItem.destroyed = function () {
  
};
