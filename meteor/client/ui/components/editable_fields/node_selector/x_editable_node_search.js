import './x_editable_node_search.html';
import { Template } from 'meteor/templating';
import { NodeComparitor } from '../../../../../imports/api/platform_type/node_comparitor.js';
import '../../node_search/node_term_search_results.js';

/**
 * Template Helpers
 */
Template.XEditableNodeSearch.helpers({
  searchResults() {
    var instance = Template.instance();
    return instance.searchResults.get();
  },
  getValue() {
    var instance = Template.instance();
    return instance.value.get();
  }
});

/**
 * Template Event Handlers
 */
Template.XEditableNodeSearch.events({
  "keydown .input-search"(e, instance) {
    e.stopImmediatePropagation();
  },
  "keyup .input-search, change .input-search"(e, instance) {
    e.stopImmediatePropagation();
    var term = instance.$(".input-search").val().trim();
    console.log("Node Selector:", term);
    instance.searchResults.set(instance.comparitor.searchByTerm(term, instance.data.projectVersionId));
  },
  "click .list-group-item"(e, instance) {
    var selection = this;
    instance.data.xEditable.$input.val(selection.node.staticId);
    instance.value.set(selection.node.staticId);
  }
});

/**
 * Template Created
 */
Template.XEditableNodeSearch.created = function () {
  var instance           = Template.instance();
  instance.searchResults = new ReactiveVar([]);
  instance.value         = new ReactiveVar("");
  instance.comparitor    = new NodeComparitor();
};

/**
 * Template Rendered
 */
Template.XEditableNodeSearch.rendered = function () {
  var instance = Template.instance(),
      value    = instance.data.xEditable.$input.val();
  if (value) {
    instance.value.set(value);
  }
  
  setTimeout(function () {
    instance.$(".input-search").focus();
  }, 500);
};

/**
 * Template Destroyed
 */
Template.XEditableNodeSearch.destroyed = function () {
  
};
