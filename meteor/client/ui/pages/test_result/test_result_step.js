import './test_result_step.html';
import { Template } from 'meteor/templating';
import { TestResultCodes } from '../../../../imports/api/test_results/test_result_codes.js';
import { TestResultStatus, TestResultStatusLookup } from '../../../../imports/api/test_results/test_result_status.js';
import { TestCaseStepTypes } from '../../../../imports/api/test_cases/test_case_step_types.js';
import { Util } from '../../../../imports/api/util.js';
import '../../components/fullscreen_viewer/fullscreen_viewer.js';
import './test_result_step_map.js';
import './test_result_step_log.js';
import './test_result_steps/test_result_step_node.js';
import './test_result_steps/test_result_step_action.js';
import './test_result_steps/test_result_step_navigate.js';
import './test_result_steps/test_result_step_wait.js';
import './test_result_steps/test_result_step_custom.js';

// TODO: This sucks, create a better way to define the pitch
const screenshotPitch = 23;

/**
 * Template Helpers
 */
Template.TestResultStep.helpers({
  logRendered() {
    return Template.instance().logRendered.get();
  },
  getScreenshotTop(index) {
    return index * screenshotPitch;
  },
  getStepClass() {
    let cssClass    = 'test-result-step-container ',
        detailClass = '';
    if (this.resultCode !== undefined && this.resultCode === TestResultCodes.pass) {
      detailClass = Util.testStepContainerClass(this.type)
    } else if(this.status === TestResultStatus.executing){
      detailClass = "";
    } else {
      switch (this.resultCode) {
        case TestResultCodes.fail:
          detailClass = "round-container-error";
          break;
        case TestResultCodes.warn:
          detailClass = "round-container-yellow";
          break;
        case TestResultCodes.pass:
          detailClass = "";
          break;
        default:
          detailClass = "round-container-grey";
      }
    }
    return cssClass + detailClass;
  },
  hasMap(){
    return this.type === TestCaseStepTypes.node || this.type === TestCaseStepTypes.action || this.type === TestCaseStepTypes.navigate
  },
  hasBegun(){
    return this.status >= TestResultStatus.executing;
  },
  isRunning(){
    return this.status === TestResultStatus.executing;
  },
  wasRun(){
    return this.resultCode !== undefined;
  },
  getStatusKey(){
    return TestResultStatusLookup[this.status]
  },
  getStepTemplate() {
    switch (this.type) {
      case TestCaseStepTypes.node:
        return "TestResultStepNode";
      case TestCaseStepTypes.action:
        return "TestResultStepAction";
      case TestCaseStepTypes.navigate:
        return "TestResultStepNavigate";
      case TestCaseStepTypes.wait:
        return "TestResultStepWait";
      case TestCaseStepTypes.custom:
        return "TestResultStepCustom";
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStep.events({
  /**
   * Reveal the log messages for a step
   * The log section is not rendered until this is pressed because it takes a while
   * @param e
   * @param instance
   */
  "click .test-result-log-reveal"(e, instance) {
    let reveal = $(e.target).closest(".test-result-log-reveal"),
        detail = instance.$(".test-result-step-log");
    
    if (detail.is(":visible")) {
      detail.hide();
    } else {
      let logRendered = instance.logRendered.get();
      if (!logRendered) {
        instance.logRendered.set(true);
      }
      detail.show();
    }
    reveal.find(".glyphicon").toggleClass("glyphicon-arrow-left");
    reveal.find(".glyphicon").toggleClass("glyphicon-arrow-right");
  },
  /**
   * As the images load the container needs to be resized
   * This is vastly simpler than know the size ahead of time
   * Ideally the absolute positioning could be avoided, but the stack visual is nice
   * @param e
   * @param instance
   */
  "load .test-result-screenshot-thumb"(e, instance) {
    let maxHeight   = 0,
        maxWidth    = 0,
        totalHeight = 0,
        width, height;
    
    instance.$(".test-result-screenshot-thumb-container").each(function (i, el) {
      width     = parseInt($(el).outerWidth());
      height    = parseInt($(el).outerHeight());
      maxWidth  = width > maxWidth ? width : maxWidth;
      maxHeight = height > maxHeight ? height : maxHeight;
      if (i > 0) {
        totalHeight += screenshotPitch;
      }
      console.log("image loop: ", i, maxHeight, totalHeight);
    });
    totalHeight += maxHeight;
    console.log("image loop complete: ", maxHeight, totalHeight);
    
    if (maxWidth && totalHeight) {
      //console.log("onload: ", instance.data._id, maxWidth, totalHeight);
      instance.$(".test-result-screenshot-thumb-list > div").height(totalHeight).width(maxWidth);
      instance.$(".test-result-screenshot-thumb-list").height(totalHeight).width(maxWidth).show();
    }
  },
  /**
   * Handle screenshot clicks
   * @param e
   * @param instance
   */
  "click .test-result-screenshot-thumb-container"(e, instance) {
    let screenshot     = this,
        testResultStep = instance.data;
    
    console.log("Screenshot click: ", screenshot, testResultStep);
    FullscreenViewer.show({
      contentTemplate: "TestResultScreenshot",
      contentData    : {
        screenshot    : screenshot,
        testResultStep: testResultStep
      }
    });
  }
});

/**
 * Template Created
 */
Template.TestResultStep.onCreated(() => {
  let instance         = Template.instance();
  instance.logRendered = new ReactiveVar(false);
});

/**
 * Template Rendered
 */
Template.TestResultStep.onRendered(() => {
});

/**
 * Template Destroyed
 */
Template.TestResultStep.onDestroyed(() => {
  
});
