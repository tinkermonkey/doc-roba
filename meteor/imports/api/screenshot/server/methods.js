import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {Screenshots} from '../screenshot.js';
import {ScreenshotComparisons} from '../screenshot_comparison.js';
import {ProcessLauncher} from '../../process_launcher/process_launcher.js';

Meteor.methods({
  /**
   * Save the context for a screenshot
   * @param screenshotId
   * @param context
   */
  saveScreenshotContext(screenshotId, context) {
    console.log("saveScreenshotContext:", screenshotId);
    //check(Meteor.userId(), String);
    check(screenshotId, String);
    check(context, Object);
    
    Screenshots.update(screenshotId, {$set: context});
  },
  
  /**
   * Run a quick comparison of two screenshots
   * @param baseScreenshotId
   * @param compareScreenshotId
   * @param forceUpdate
   */
  templateCompareScreenshots(baseScreenshotId, compareScreenshotId, forceUpdate) {
    console.log("templateCompareScreenshots:", baseScreenshotId, compareScreenshotId);
    check(Meteor.userId(), String);
    check(baseScreenshotId, String);
    check(compareScreenshotId, String);
    
    // check for an cached comparison
    var comparison = ScreenshotComparisons.findOne({baseScreenshot: baseScreenshotId, compareScreenshot: compareScreenshotId});
    if(comparison){
      // check for project permissions
      
      if(forceUpdate){
        ScreenshotComparisons.remove(comparison._id);
      } else {
        return comparison;
      }
    }
    
    // grab the screenshots
    var baseScreenshot = Screenshots.findOne(baseScreenshotId),
        comparisonScreenshot = Screenshots.findOne(compareScreenshotId);
    
    check(baseScreenshot, FS.File);
    check(comparisonScreenshot, FS.File);
    
    // check project permissions
    
    if(baseScreenshot.hasStored("screenshots") && comparisonScreenshot.hasStored("screenshots")){
      var basePath = FS.basePath + "screenshots/" + baseScreenshot.getCopyInfo("screenshots").key,
          comparisonPath = FS.basePath + "screenshots/" + comparisonScreenshot.getCopyInfo("screenshots").key,
          command = "template_align.py " + basePath + " " + comparisonPath,
          logFile = "template_align_" + baseScreenshotId + "_" + compareScreenshotId + ".log";
      
      ProcessLauncher.launchImageTask(command, logFile, Meteor.bindEnvironment((output) => {
        try {
          var result = JSON.parse(output);
        } catch (e) {
          console.debug("templateCompareScreenshots JSON parse failed: \n" + output + "\n");
          throw new Meteor.Error("templateCompareScreenshots failed: result could not be parsed, " + e.toString());
        }
        
        ScreenshotComparisons.insert({projectId: baseScreenshot.projectId, baseScreenshot: baseScreenshotId, compareScreenshot: compareScreenshotId, result: result});
      }));
    } else {
      throw new Meteor.Error("templateCompareScreenshots failed: one or more screenshots could not be found");
    }
  }
});
