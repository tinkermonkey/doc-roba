import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

/**
 * These records are for tracking the wait status of all roles for each Wait step that they have
 */
export const TestResultStepWait = new SimpleSchema({
  // Link to the project to which this test belongs
  projectId       : {
    type      : String,
    denyUpdate: true
  },
  // Link to the project version to which this test belongs
  projectVersionId: {
    type      : String,
    denyUpdate: true
  },
  // Link to the test run
  testRunId       : {
    type      : String,
    denyUpdate: true,
    optional  : true
  },
  // Link to the test result
  testResultId    : {
    type      : String,
    denyUpdate: true
  },
  // The waitId is the testCaseStepId of one of the wait steps
  // It's not unique on it's own and must be combined with the testResultId
  waitId          : {
    type      : String,
    denyUpdate: true
  },
  // List of testResultRoleIds that we're waiting for
  awaitingRoleIds : {
    type      : [ String ],
    denyUpdate: true
  },
  checkedInRoleIds: {
    type    : [ String ],
    optional: true
  },
  checkedInTimes  : {
    type    : [ Object ],
    blackbox: true,
    optional: true
  },
  everyoneArrived : {
    type        : Boolean,
    defaultValue: false
  }
});

export const TestResultStepWaits = new Mongo.Collection("test_result_step_waits");
TestResultStepWaits.attachSchema(TestResultStepWait);

/**
 * Helpers
 */
TestResultStepWaits.helpers({
  /**
   * Get the checked in time for a role
   * @param testResultRoleId
   * @return {T}
   */
  roleCheckedInEntry(testResultRoleId){
    let checkedInTimes = this.checkedInTimes || [],
        matchList      = checkedInTimes.filter((entry) => {
          return entry.testResultRoleId === testResultRoleId
        });
    
    if (matchList) {
      return matchList[ 0 ];
    }
  },
  /**
   * Get the order that this role checked in
   * @param testResultRoleId
   * @return {T}
   */
  roleCheckedInOrder(testResultRoleId){
    let checkedInTimes = this.checkedInTimes || [];
    
    return checkedInTimes.sort((entry) => {
          return entry.time
        })
        .reverse()
        .map((entry) => {
          return entry.testResultRoleId
        })
        .indexOf(testResultRoleId);
  },
  /**
   * Get the number of ms after the first checkin that the specified role checked in
   * @param testResultRoleId
   * @return {T}
   */
  roleCheckedInDelta(testResultRoleId){
    let checkedInTimes = this.checkedInTimes || [],
    checkedInOrder = this.roleCheckedInOrder(testResultRoleId),
    sortedTimes = checkedInTimes.sort((entry) => {
          return entry.time
        })
        .reverse();
    
    if(sortedTimes.length){
      return sortedTimes[checkedInOrder].time - sortedTimes[0].time
    }
  },
  /**
   * Get the checked in entries for the other roles
   * @param testResultRoleId
   * @return {Array.<T>}
   */
  otherRolesCheckedInEntries(testResultRoleId){
    let checkedInTimes = this.checkedInTimes || [];
    
    return checkedInTimes.sort((entry) => {
          return entry.time
        })
        .reverse()
        .filter((entry) => {
          return entry.testResultRoleId !== testResultRoleId
        });
    
  },
  /**
   * Get the testResultRoleIds of the roles that failed to check in
   */
  neverCheckedInRoleIds(){
    return _.difference(this.checkedInRoleIds || [], this.awaitingRoleIds || []);
  }
});