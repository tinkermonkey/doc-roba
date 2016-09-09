/**
 * Template Helpers
 */
Template.EditableTitleDescription.helpers({});

/**
 * Template Event Handlers
 */
Template.EditableTitleDescription.events({});

/**
 * Template Created
 */
Template.EditableTitleDescription.created = function () {
  
};

/**
 * Template Rendered
 */
Template.EditableTitleDescription.rendered = function () {
  let instance = Template.instance();

  instance.$(".editable-title-description").editable({
    type: "titleDescriptionEditor",
    mode: instance.data.mode || "popup",
    placement: instance.data.placement || "auto",
    value: instance.data.value,
    emptyText: instance.data.emptyText || "No Title",
    highlight: false,
    display: function () {},
    success: function (response, newValue) {
      var editedElement = this;
      $(editedElement).trigger("edited", [newValue]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });

  instance.autorun(function () {
    var data = Template.currentData();
    instance.$(".editable-title-description").editable("setValue", data.value);
  });

};

/**
 * Template Destroyed
 */
Template.EditableTitleDescription.destroyed = function () {
  
};
