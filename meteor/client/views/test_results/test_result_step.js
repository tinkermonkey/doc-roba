// TODO: This sucks, create a better way to define the pitch
var screenshotPitch = 23;

/**
 * Template Helpers
 */
Template.TestResultStep.helpers({
  logRendered: function () {
    return Template.instance().logRendered.get();
  },
  getScreenshotTop: function (screenshot, list) {
    return (list.length - screenshot.index - 1) * screenshotPitch;
  },
  getStepClass: function () {
    if(this.resultCode != null && this.resultCode == TestResultCodes.pass){
      return Util.testStepContainerClass(this.type)
    } else {
      switch (this.resultCode) {
        case TestResultCodes.fail:
          return "round-container-error";
        case TestResultCodes.warn:
          return "round-container-yellow";
        default:
          return "round-container-grey"
      }
    }
  },
  getStepTemplate: function () {
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
  "click .test-result-log-reveal": function (e, instance) {
    var reveal = $(e.target).closest(".test-result-log-reveal"),
      detail = instance.$(".test-result-step-log");

    if(detail.is(":visible")){
      detail.hide();
    } else {
      var logRendered = instance.logRendered.get();
      if(!logRendered){
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
  "load .test-result-screenshot": function (e, instance) {
    var maxHeight = 0,
      maxWidth = 0,
      totalHeight = 0,
      width, height;

    instance.$(".test-result-screenshot-container").each(function (i, el) {
      width = parseInt($(el).outerWidth());
      height = parseInt($(el).outerHeight());
      maxWidth = width > maxWidth ? width : maxWidth;
      maxHeight = height > maxHeight ? height : maxHeight;
      if(i > 0){
        totalHeight += screenshotPitch;
      }
      console.log("image loop: ", i, maxHeight, totalHeight);
    });
    totalHeight += maxHeight;
    console.log("image loop complete: ", maxHeight, totalHeight);

    if(maxWidth && totalHeight){
      //console.log("onload: ", instance.data._id, maxWidth, totalHeight);
      instance.$(".test-result-screenshot-list > div").height(totalHeight).width(maxWidth);
      instance.$(".test-result-screenshot-list").height(totalHeight).width(maxWidth).show();
    }
  }
});

/**
 * Template Created
 */
Template.TestResultStep.created = function () {
  var instance = this;
  instance.logRendered = new ReactiveVar(false);
};

/**
 * Template Rendered
 */
Template.TestResultStep.rendered = function () {
};

/**
 * Template Destroyed
 */
Template.TestResultStep.destroyed = function () {
  
};
