import './test_plan_item_template.html';
import { Template } from 'meteor/templating';
import { TestPlans } from '../../../../../imports/api/test_plans/test_plans.js';
import { TestPlanItems } from '../../../../../imports/api/test_plans/test_plan_items.js';
import { TestRunItemTypes } from '../../../../../imports/api/test_runs/test_run_item_types.js';

/**
 * Template Helpers
 */
Template.TestPlanItemTemplate.helpers({
  getTemplate () {
    return TestPlans.findOne({ staticId: this.config.testPlanId, projectVersionId: this.projectVersionId });
  },
  itemCount () {
    return TestPlanItems.find({
      testPlanId      : this.staticId,
      type            : TestRunItemTypes.test,
      projectVersionId: this.projectVersionId
    }).count();
  },
  stageCount () {
    return TestPlanItems.find({
      parentId        : this.staticId,
      type            : TestRunItemTypes.stage,
      projectVersionId: this.projectVersionId
    }).count();
  }
});

/**
 * Template Event Handlers
 */
Template.TestPlanItemTemplate.events({});

/**
 * Template Created
 */
Template.TestPlanItemTemplate.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.TestPlanItemTemplate.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TestPlanItemTemplate.onDestroyed(() => {
  
});
