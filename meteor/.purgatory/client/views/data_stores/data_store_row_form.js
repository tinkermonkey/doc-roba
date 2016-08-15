/**
 * Template Helpers
 */
Template.DataStoreRowForm.helpers({});

/**
 * Template Helpers
 */
Template.DataStoreRowForm.events({});

/**
 * Template Rendered
 */
Template.DataStoreRowForm.rendered = function () {
  var instance = this;

  setTimeout(function () {
    instance.$("input").first().focus()
  }, 200);
};

/**
 * Template Destroyed
 */
Template.DataStoreRowForm.destroyed = function () {

};
