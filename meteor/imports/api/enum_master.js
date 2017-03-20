import { Meteor } from 'meteor/meteor';
//Enums used by the automation
import { AdventureStatus } from './adventures/adventure_status.js';
import { AdventureStepStatus } from './adventures/adventure_step_status.js';
import { NodeCheckTypes } from './nodes/node_check_types.js';
import { ScreenshotKeys } from './screenshots/screenshot_keys.js';
import { TestCaseStepTypes } from './test_cases/test_case_step_types.js';
import { TestResultCodes } from './test_results/test_result_codes.js';
import { TestResultStatus } from './test_results/test_result_status.js';

let enumMap = {
  AdventureStatus    : AdventureStatus,
  AdventureStepStatus: AdventureStepStatus,
  NodeCheckTypes     : NodeCheckTypes,
  ScreenshotKeys     : ScreenshotKeys,
  TestCaseStepTypes  : TestCaseStepTypes,
  TestResultCodes    : TestResultCodes,
  TestResultStatus   : TestResultStatus
};

if (Meteor.isServer) {
  Meteor.methods({
    loadEnum(name){
      //console.debug('loadEnum:', name);
      check(Meteor.userId(), String);
      check(name, String);
      
      if (enumMap[ name ]) {
        return enumMap[ name ]
      } else {
        throw new Meteor.error("404", "Not found", "No enum found for name [" + name + "]");
      }
    }
  });
}