import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {TestSystems} from '../test_systems.js';

Meteor.methods({
  // Update the status of a helper
  setTestSystemStatus(testSystemId, status) {
    console.log("setTestSystemStatus: ", testSystemId, status);
    check(testSystemId, String);
    check(status, Number);
    
    if (testSystemId) {
      var testSystem = TestSystems.findOne({_id: testSystemId});
      if (testSystem) {
        TestSystems.update({_id: testSystem._id}, {$set: {status: status}});
      }
    }
  },
  
  // Get the status of a test system
  getTestSystemStatus(testSystemId) {
    check(testSystemId, String);
    if (testSystemId) {
      var testSystem = TestSystems.findOne({_id: testSystemId});
      if (testSystem) {
        return testSystem.status;
      }
    }
  },
  
  // Set the current log file name of a test system
  setTestSystemLogFile(testSystemId, path) {
    check(testSystemId, String);
    check(path, String);
    TestSystems.update({_id: testSystemId}, {$set: {logFile: path}});
  },
  
  // Retrieve the record for a test system
  loadTestSystemRecord(testSystemId) {
    console.log("loadTestSystemRecord: ", testSystemId);
    check(testSystemId, String);
    return TestSystems.findOne({_id: testSystemId});
  },
});
