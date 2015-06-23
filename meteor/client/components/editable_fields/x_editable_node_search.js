/**
 * Template Helpers
 */
Template.XEditableNodeSearch.helpers({
  searchResults: function () {
    var instance = Template.instance();
    return instance.searchResults.get();
  },
  getValue: function () {
    var instance = Template.instance();
    return instance.value.get();
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
  },
  "click .list-group-item": function (e, instance) {
    var selection = this;
    instance.data.xEditable.$input.val(selection.node.staticId);
    instance.value.set(selection.node.staticId);
  }
});

/**
 * Template Created
 */
Template.XEditableNodeSearch.created = function () {
  var instance = Template.instance();
  instance.searchResults = new ReactiveVar([]);
  instance.value = new ReactiveVar("");
};

/**
 * Template Rendered
 */
Template.XEditableNodeSearch.rendered = function () {
  var instance = Template.instance(),
    value = instance.data.xEditable.$input.val();
  if(value){
    instance.value.set(value);
  }
};

/**
 * Template Destroyed
 */
Template.XEditableNodeSearch.destroyed = function () {
  console.log("XEditableNodeSearch: destroyed");
};
