/**
 * Template Helpers
 */
Template.TestResultScreenshot.helpers({
  isScaled: function () {
    var dimensions = Template.instance().dimensions.get();
    return dimensions && dimensions.viewScale && dimensions.viewScale != 1
  },
  getScreenshotDimensions: function () {
    var dimensions = Template.instance().dimensions.get();
    if(dimensions && dimensions.width && dimensions.height){
      return dimensions.width + " px &#215; " + dimensions.height + " px"
    }
  },
  getScaledDimensions: function () {
    var dimensions = Template.instance().dimensions.get();
    if(dimensions && dimensions.scaledWidth && dimensions.scaledHeight){
      return dimensions.scaledWidth + " px &#215; " + dimensions.scaledHeight + " px @ " + numeral(dimensions.viewScale).format("0.0");
    }
  },
  getSimilarScreenshots: function () {
    return Screenshots.similarScreenshots(this);
  },
  getPreviousVersionScreenshots: function () {
    return Screenshots.previousVersionScreenshots(this);
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultScreenshot.events({
  "load .test-result-screenshot": function (e, instance) {

    // hide the spinner
    setTimeout(function () {
      instance.$(".test-result-screenshot-spinner").hide();
      instance.$(".test-result-screenshot-wrapper").removeClass("hide");
      setTimeout(function () {
        // size the image to fit the window
        var width = instance.$(".test-result-screenshot").width(),
          height = instance.$(".test-result-screenshot").height(),
          aspectRatio = width && height ? width / height : 1,
          screenWidth = $(".dr-fullscreen-viewer").width(),
          screenHeight = $(".dr-fullscreen-viewer").height(),
          hMargin = 350,
          vMargin = 350,
          scale = Math.min((screenWidth - hMargin) / width, (screenHeight - vMargin) / height, 1);
        //console.log("test-result-screenshot loaded: ", width, height, aspectRatio, screenWidth, screenHeight, scale);

        // store the original dimensions
        instance.dimensions.set({
          width: width,
          height: height,
          viewScale: scale,
          scaledWidth: parseInt(scale * width),
          scaledHeight: parseInt(scale * height)
        });

        instance.$(".test-result-screenshot-wrapper").attr("style", "");
        instance.$(".test-result-screenshot").width(parseInt(scale * width) + "px").height(parseInt(scale * height) + "px");
      }, 100);
    }, 250);
  }
});

/**
 * Template Created
 */
Template.TestResultScreenshot.created = function () {
  var instance = this;
  instance.dimensions = new ReactiveVar();

  // pull in the comparison screenshots
  if(instance.data.screenshot && instance.data.screenshot._id){
    console.log("subscribing to screenshots: ", instance.data.screenshot._id);
    instance.subscribe("similar_screenshots", instance.data.screenshot._id);
    instance.subscribe("previous_version_screenshots", instance.data.screenshot._id);
  }
};

/**
 * Template Rendered
 */
Template.TestResultScreenshot.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.TestResultScreenshot.destroyed = function () {
  
};
