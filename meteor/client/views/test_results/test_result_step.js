// TODO: This sucks, create a better way to define the pitch
var screenshotPitch = 23;

/**
 * Template Helpers
 */
Template.TestResultStep.helpers({
  getScreenshotBottom: function () {
    return this.index * screenshotPitch;
  },
  getScreenshotTop: function (screenshot, list) {
    return (list.length - screenshot.index - 1) * screenshotPitch;
  },
  getStepClass: function () {
    switch (this.status) {
      case TestResultStatus.executing:
      case TestResultStatus.launched:
        return "test-result-step-executing";
      case TestResultStatus.complete:
        return "test-result-step-type-" + this.type + " test-step-result-" + this.resultCode;
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
  },
  getStepTitle: function () {
    return TestCaseStepTypesLookup[this.type]
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStep.events({
  "click .test-result-log-reveal": function (e, instance) {
    var reveal = $(e.target).closest(".test-result-log-reveal"),
      detail = instance.$(".test-result-step-log");

    if(detail.is(":visible")){
      detail.hide();
    } else {
      detail.show();
    }
    reveal.find(".glyphicon").toggleClass("glyphicon-arrow-left");
    reveal.find(".glyphicon").toggleClass("glyphicon-arrow-right");
  },
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
