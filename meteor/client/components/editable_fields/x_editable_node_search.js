/**
 * Template Helpers
 */
Template.XEditableNodeSearch.helpers({
  searchResults: function () {
    var instance = Template.instance();
    return instance.searchResults.get();
  }
});

/**
 * Template Event Handlers
 */
Template.XEditableNodeSearch.events({
  "keyup .input-search, change .input-search": function (e, instance) {
    e.stopImmediatePropagation();
    var term = instance.$(".input-search").val().trim();
    instance.searchResults.set(NodeSearch.byTerm(term, instance.data.projectVersionId));
  }
});

/**
 * Template Created
 */
Template.XEditableNodeSearch.created = function () {
  var instance = Template.instance();
  instance.searchResults = new ReactiveVar([]);
};

/**
 * Template Rendered
 */
Template.XEditableNodeSearch.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.XEditableNodeSearch.destroyed = function () {
  
};
