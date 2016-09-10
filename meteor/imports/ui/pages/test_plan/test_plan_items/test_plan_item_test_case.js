import './test_plan_item_test_case.html';
import { Template } from 'meteor/templating';
import { TestCases } from '../../../../api/test_case/test_case.js';
import { TestGroups } from '../../../../api/test_case/test_group.js';

/**
 * Template Helpers
 */
Template.TestPlanItemTestCase.helpers({
  getTestCase () {
    return TestCases.findOne({ staticId: this.config.testCaseId, projectVersionId: this.projectVersionId });
  },
  getBreadcrumbs () {
    var instance = Template.instance();
    return instance.getBreadcrumbs(this, [ this.title ]).reverse();
  }
});

/**
 * Template Event Handlers
 */
Template.TestPlanItemTestCase.events({});

/**
 * Template Created
 */
Template.TestPlanItemTestCase.onCreated(() => {
  let instance            = Template.instance();
  instance.getBreadcrumbs = function (item, breadcrumbs) {
    var parentId = item.testGroupId || item.parentGroupId;
    if (parentId) {
      var parent = TestGroups.findOne({ staticId: parentId, projectVersionId: item.projectVersionId });
      if (parent) {
        breadcrumbs = breadcrumbs.concat(instance.getBreadcrumbs(parent, [ parent.title ]));
      }
    }
    return breadcrumbs;
  }
});

/**
 * Template Rendered
 */
Template.TestPlanItemTestCase.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TestPlanItemTestCase.onDestroyed(() => {
  
});
