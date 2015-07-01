/**
 * Template Helpers
 */
Template.TestCaseListItem.helpers({});

/**
 * Template Event Handlers
 */
Template.TestCaseListItem.events({});

/**
 * Template Created
 */
Template.TestCaseListItem.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestCaseListItem.rendered = function () {
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
};

/**
 * Template Destroyed
 */
Template.TestCaseListItem.destroyed = function () {
  
};
