/**
 * Template Helpers
 */
Template.TestRunTemplateListItem.helpers({});

/**
 * Template Event Handlers
 */
Template.TestRunTemplateListItem.events({

});

/**
 * Template Created
 */
Template.TestRunTemplateListItem.created = function () {
};

/**
 * Template Rendered
 */
Template.TestRunTemplateListItem.rendered = function () {
  var instance = Template.instance();

  // make this draggable
  instance.$(".test-case-list-selectable").draggable({
    revert: true,
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
Template.TestRunTemplateListItem.destroyed = function () {
  
};
