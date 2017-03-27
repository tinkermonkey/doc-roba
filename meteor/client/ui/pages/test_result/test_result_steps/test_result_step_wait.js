import './test_result_step_wait.html';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { TestResultRoles } from '../../../../../imports/api/test_results/test_result_roles.js';
import { TestResultStepWaits } from '../../../../../imports/api/test_results/test_result_step_waits.js';

/**
 * Template Helpers
 */
Template.TestResultStepWait.helpers({
  waitRecord(){
    let step = this;
    return TestResultStepWaits.findOne({
      testResultId: step.testResultId,
      waitId      : step.data.waitId
    });
  },
  checkedInTime(step){
    return this.roleCheckedInEntry(step.testResultRoleId);
  },
  checkedInOrder(waitResult){
    let checkedInOrder = waitResult.roleCheckedInOrder(this.testResultRoleId);
    if (checkedInOrder !== undefined) {
      return numeral(checkedInOrder + 1).format('Oo');
    }
  },
  otherCheckedInTimes(step){
    return this.otherRolesCheckedInEntries(step.testResultRoleId);
  },
  neverCheckedInRoles(){
    return this.neverCheckedInRoleIds();
  },
  getRoleName(testResultRoleId){
    let role = TestResultRoles.findOne(testResultRoleId);
    if (role) {
      return role.role().title
    }
  },
  getRoleAccountName(testResultRoleId){
    return Template.instance().roleNames.get(testResultRoleId);
  },
  getRoleDelta(waitResult){
    return waitResult.roleCheckedInDelta(this.testResultRoleId);
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStepWait.events({});

/**
 * Template Created
 */
Template.TestResultStepWait.onCreated(() => {
  let instance       = Template.instance();
  instance.roleNames = new ReactiveDict();
  
  instance.autorun(() => {
    console.log('TestResultStepWait autorun');
    let testResultStep = Template.currentData(),
        updateCount    = 0;
    
    testResultStep.testResult().roleResults().forEach((roleResult) => {
      let existingValue = instance.roleNames.get(roleResult._id);
      if (roleResult.accountId && !existingValue) {
        updateCount++;
        console.log('Fetching rendered row for accountId', roleResult.accountId);
        Meteor.call('getRenderedDatastoreRow', roleResult.projectId, roleResult.projectVersionId, roleResult.accountId, (error, result) => {
          if (error) {
            console.error('Error getting rendered account name:', error);
          } else {
            console.log('Result:', roleResult._id, result);
            instance.roleNames.set(roleResult._id, result);
          }
        });
      }
    });
  })
});

/**
 * Template Rendered
 */
Template.TestResultStepWait.onRendered(() => {
});

/**
 * Template Destroyed
 */
Template.TestResultStepWait.onDestroyed(() => {
});
