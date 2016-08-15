import {Meteor} from 'meteor/meteor';
import {Auth} from '../../auth.js';
import {Screenshots} from '../screenshot.js';
import {ScreenshotComparisons} from '../screenshot_comparison.js';

Meteor.publish("similar_screenshots", function (screenshotId) {
  console.debug("Publish: similar_screenshots:", screenshotId);
  if(this.userId && screenshotId){
    var screenshot = Screenshots.findOne(screenshotId);
    if(screenshot && Auth.hasProjectAccess(this.userId, screenshot.projectId)){
      return Screenshots.similarScreenshots(screenshot);
    }
  }
  return [];
});

Meteor.publish("previous_version_screenshots", function (screenshotId) {
  console.debug("Publish: previous_version_screenshots:", screenshotId);
  if(this.userId && screenshotId) {
    var screenshot = Screenshots.findOne(screenshotId);
    if (screenshot && Auth.hasProjectAccess(this.userId, screenshot.projectId)) {
      return Screenshots.similarScreenshots(screenshot);
    }
  }
  return [];
});

Meteor.publish("screenshot_comparison", function (baseScreenshotId, compareScreenshotId) {
  console.debug("Publish: screenshot_comparison:", baseScreenshotId, compareScreenshotId);
  if(this.userId && baseScreenshotId && compareScreenshotId) {
    return ScreenshotComparisons.find({
      baseScreenshot: baseScreenshotId,
      compareScreenshot: compareScreenshotId
    });
  }
});
