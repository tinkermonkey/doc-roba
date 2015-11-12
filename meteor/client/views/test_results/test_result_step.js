// TODO: This sucks, find a better way to figure out the pitch
var screenshotPitch = 23;

/**
 * Template Helpers
 */
Template.TestResultStep.helpers({
  screenshots: function () {
    return ScreenShots.find({ testResultStepId: this.step._id }, {sort: {uploadedAt: -1}}).map(function (image, i) {image.index = i; return image});
  },
  getScreenshotBottom: function () {
    return this.index * screenshotPitch;
  },
  getStepClass: function () {
    switch (this.step.status) {
      case TestResultStatus.executing:
      case TestResultStatus.launched:
        return "test-result-step-executing";
      case TestResultStatus.complete:
        return "test-result-step-type-" + this.step.type + " test-step-result-" + this.step.resultCode;
    }
  },
  getStepTemplate: function () {
    switch (this.step.type) {
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
  getStepLogMessages: function () {
    if(this.stepMap[this.step._id].order < this.stepMap.list.length - 1){
      // for most steps grab all of the messages after the context start and before the next start
      return LogMessages.find({
        "context.testResultRoleId": this.step.testResultRoleId,
        $and: [
          { time: { $gte: this.stepMap[this.step._id].startTime } },
          { time: { $lt: this.stepMap[this.step._id].endTime } }
        ]
      }, {sort: {time: 1}});
    } else {
      // for the last step grab everything
      return LogMessages.find({
        "context.testResultRoleId": this.step.testResultRoleId,
        time: { $gte: this.stepMap[this.step._id].startTime }
      }, {sort: {time: 1}});
    }
  },
  getResultSteps: function () {
    if(this.stepMap && this.step && this.step._id && this.stepMap[this.step._id]){
      return this.stepMap[this.step._id].navigationSteps;
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultStep.events({
  "click .test-result-detail-1-reveal": function (e, instance) {
    var reveal = $(e.target).closest(".test-result-detail-reveal"),
      detail1 = instance.$(".test-result-detail-1"),
      detail2 = instance.$(".test-result-detail-2"),
      reveal2 = instance.$(".test-result-detail-2-reveal");

    // show the detail-1 content
    if(detail1.is(":visible")){
      detail2.fadeOut();
      reveal2.fadeOut();
      detail1.fadeOut();
    } else {
      detail1.fadeIn();
      reveal2.fadeIn();
    }

    reveal.find(".glyphicon").toggleClass("glyphicon-arrow-left");
    reveal.find(".glyphicon").toggleClass("glyphicon-arrow-right");
  },
  "click .test-result-detail-2-reveal": function (e, instance) {
    var reveal2 = $(e.target).closest(".test-result-detail-reveal"),
      detail2 = instance.$(".test-result-detail-2");

    if(detail2.is(":visible")){
      detail2.fadeOut();
    } else {
      detail2.fadeIn();
    }
    reveal2.find(".glyphicon").toggleClass("glyphicon-arrow-left");
    reveal2.find(".glyphicon").toggleClass("glyphicon-arrow-right");
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
      totalHeight += screenshotPitch;
    });
    totalHeight += maxHeight - screenshotPitch;

    if(maxWidth && totalHeight){
      //console.log("onload: ", instance.data._id, maxWidth, totalHeight);
      instance.$(".test-result-screenshots > div").height(totalHeight).width(maxWidth);
      instance.$(".test-result-screenshots").height(totalHeight).width(maxWidth).show();
    }
  }
});

/**
 * Template Created
 */
Template.TestResultStep.created = function () {
  this.timeCreated = Date.now();
  //console.log("TestResultStep.created: ", Date.now());
};

/**
 * Template Rendered
 */
Template.TestResultStep.rendered = function () {
  //console.log("TestResultStep.rendered: ", Date.now() - this.timeCreated);
};

/**
 * Template Destroyed
 */
Template.TestResultStep.destroyed = function () {
  
};
