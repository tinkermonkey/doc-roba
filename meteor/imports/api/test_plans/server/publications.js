import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {TestPlans} from '../test_plans.js';
import {TestPlanItems} from '../test_plan_items.js';

Meteor.publish("test_plans", function (projectId, projectVersionId) {
  console.debug("Publish: test_plans");
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestPlans.find({projectVersionId: projectVersionId});
  }
  return [];
});

Meteor.publish("test_plan_items", function (projectId, projectVersionId) {
  console.debug("Publish: test_plan_items");
  if(Auth.hasProjectAccess(this.userId, projectId) && projectVersionId){
    return TestPlanItems.find({projectVersionId: projectVersionId});
  }
  return [];
});
