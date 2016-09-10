import './test_plan_item_test_group.html';
import { Template } from 'meteor/templating';
import { TestCases } from '../../../../api/test_case/test_case.js';
import { TestGroups } from '../../../../api/test_case/test_group.js';

/**
 * Template Helpers
 */
Template.TestPlanItemTestGroup.helpers({
  getTestGroup () {
    return TestGroups.findOne({ staticId: this.config.testGroupId, projectVersionId: this.projectVersionId });
  },
  getBreadcrumbs () {
    return Template.instance().getBreadcrumbs(this, [ this.title ]).reverse();
  },
  getTests () {
    return Template.instance().getTests(this);
  }
});

/**
 * Template Event Handlers
 */
Template.TestPlanItemTestGroup.events({
  "click .test-group-expander" (e, instance) {
    instance.$(".test-group-expander").toggleClass("rotate");
    //instance.$(".test-group-test-list").toggleClass("show");
    instance.$(".test-group-test-list").slideToggle();
  }
});

/**
 * Template Created
 */
Template.TestPlanItemTestGroup.onCreated(() => {
  let instance = Template.instance();
  
  // Get the breadcrumbs for the test group
  instance.getBreadcrumbs = function (item, breadcrumbs) {
    var parentId = item.testGroupId || item.parentGroupId;
    if (parentId) {
      var parent = TestGroups.findOne({ staticId: parentId, projectVersionId: item.projectVersionId });
      if (parent) {
        breadcrumbs = breadcrumbs.concat(instance.getBreadcrumbs(parent, [ parent.title ]));
      }
    }
    return breadcrumbs;
  };
  
  // Get the list of tests in this group
  instance.getTests = function (group) {
    var tests = [];
    
    // get the tests
    TestCases.find({ testGroupId: group.staticId, projectVersionId: group.projectVersionId }, { sort: { title: 1 } })
        .forEach(function (test) {
          test.breadcrumbs = instance.getBreadcrumbs(test, [ test.title ]).reverse();
          tests.push(test);
        });
    
    // Get the tests for sub-groups
    TestGroups.find({ parentGroupId: group.staticId, projectVersionId: group.projectVersionId }, { sort: { title: 1 } })
        .forEach(function (child) {
          tests = tests.concat(instance.getTests(child));
        });
    
    return tests;
  };
});

/**
 * Template Rendered
 */
Template.TestPlanItemTestGroup.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TestPlanItemTestGroup.onDestroyed(() => {
  
});
