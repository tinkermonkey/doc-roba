import './test_case_list_group.html';

import {Template} from 'meteor/templating';

/**
 * Template Helpers
 */
Template.TestCaseListGroup.helpers({
  isExpanded() {
    return Template.instance().expanded.get();
  }
});

/**
 * Template Event Handlers
 */
Template.TestCaseListGroup.events({
  "dblclick .test-case-list-group"(e, instance) {
    e.stopImmediatePropagation();
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

};

/**
 * Template Destroyed
 */
Template.TestCaseListGroup.destroyed = function () {
  
};
