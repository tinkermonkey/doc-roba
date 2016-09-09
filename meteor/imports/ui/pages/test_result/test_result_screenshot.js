/**
 * Template Helpers
 */
Template.TestResultScreenshot.helpers({
  layers: function () {
    if(Template.instance().layers){
      return _.values(Template.instance().layers.get());
    }
  },
  isScaled: function () {
    var scale = Template.instance().scale.get();
    return scale != 1
  },
  getScale: function () {
    return Template.instance().scale.get();
  },
  isMultiLayer: function () {
    return _.values(Template.instance().layers.get()).length > 1
  },
  getScreenshotDimensions: function () {
    var layers = Template.instance().layers.get(),
      screenshot = this;
    if(layers && screenshot && screenshot._id && layers[screenshot._id]){
      return layers[screenshot._id].naturalWidth + " px &#215; " + layers[screenshot._id].naturalHeight + " px"
    }
  },
  getScaledDimensions: function () {
    var layers = Template.instance().layers.get(),
      scale = Template.instance().scale.get(),
      screenshot = this;
    if(layers && screenshot && screenshot._id && layers[screenshot._id]){
      return layers[screenshot._id].scaledWidth + " px &#215; " + layers[screenshot._id].scaledHeight + " px @ " + numeral(scale).format("0.0")
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
  /**
   * When the images load, update all of the sizing & positioning
   * @param e
   * @param instance
   */
  "load .test-result-screenshot": function (e, instance) {
    console.log("Screenshot Load: ", this);

    // hide the spinner
    setTimeout(function () {
      instance.$(".test-result-screenshot-spinner").hide();
      instance.$(".test-result-screenshot-wrapper").removeClass("hide");
      setTimeout(function () {
        var el = $(e.target),
          screenWidth = $(".dr-fullscreen-viewer").width(),
          screenHeight = $(".dr-fullscreen-viewer").height(),
          margin = parseInt($(".test-result-screenshot-position-layer").css("margin-left")),
          screenshotId = el.attr("data-pk"),
          hMargin = 350,
          vMargin = 350,
          layers = instance.layers.get(),
          width = el.width(),
          height = el.height(),
          scale = Math.min((screenWidth - hMargin) / width, (screenHeight - vMargin) / height, 1);

        // store the data for the newly loaded image
        layers[screenshotId].naturalWidth = width;
        layers[screenshotId].naturalHeight = height;
        layers[screenshotId].naturalScale = scale;

        //console.log("test-result-screenshot loaded: ", el);
        //console.log("test-result-screenshot loaded: ", screenWidth, screenHeight, width, height, scale);

        // update the layers
        instance.layers.set(layers);

        // calculate the view scale
        //console.log("Scales: ", _.map(layers, function (layer) { return _.isNumber(layer.naturalScale) ? layer.naturalScale : 1 }));
        var viewScale = _.min(_.map(layers, function (layer) { return _.isNumber(layer.naturalScale) ? layer.naturalScale : 1 }));
        instance.scale.set(viewScale);

        //console.log("test-result-screenshot final: ", viewScale);

        // update all of the images with the view scale
        _.each(_.values(layers), function (layer) {
          layer.scaledWidth = parseInt(viewScale * layer.naturalWidth);
          layer.scaledHeight = parseInt(viewScale * layer.naturalHeight);
          instance.$(".test-result-screenshot[data-pk=" + layer.screenshot._id + "]").width(layer.scaledWidth + "px").height(layer.scaledHeight + "px");
        });

        // size the container
        var maxWidth = _.max(_.map(layers, function (layer) { return _.isNumber(layer.scaledWidth) ? layer.scaledWidth : 0 })),
          maxHeight = _.max(_.map(layers, function (layer) { return _.isNumber(layer.scaledHeight) ? layer.scaledHeight : 0 }));
        $(".test-result-screenshot-buffer-layer").width(2 * margin + maxWidth + "px").height(2 * margin + maxHeight + "px");
        $(".test-result-screenshot-position-layer").width(maxWidth + "px").height(maxHeight + "px");

        // Make sure the wrapper is visible
        instance.$(".test-result-screenshot-wrapper").attr("style", "");

        // Show the most recently loaded image
        el.css("opacity", 1);
      }, 100);
    }, 250);
  },

  /**
   * Allow screenshots to be added for comparison
   * @param e
   * @param instance
   */
  "click .test-result-comparison-thumb": function (e, instance) {
    e.stopImmediatePropagation();

    var screenshot = this,
      layers = instance.layers.get();
    console.log("Click: ", screenshot, layers);

    if(layers && screenshot && screenshot._id && !layers[screenshot._id]){
      layers[screenshot._id] = {
        screenshot: screenshot
      };

      // see if the comparison is already loaded
      var comparison = ScreenshotComparisons.findOne({baseScreenshot: instance.data.screenshot._id, compareScreenshot: screenshot._id});
      if(comparison){
        layers[screenshot._id].transform = comparison.result.transform;
      }

      instance.layers.set(layers);

      // load the comparison
      Meteor.call("templateCompareScreenshots", instance.data.screenshot._id, screenshot._id, function (error, result) {
        if(error){
          RobaDialog.error("Screenshot comparison failed: " + error);
        } else {
          console.log("Screenshot comparison result: ", result);
          instance.subscribe("screenshot_comparison", instance.data.screenshot._id, screenshot._id);
        }
      });
    }
  },

  /**
   * Allow screenshots to be added for comparison
   * @param e
   * @param instance
   */
  "click .btn-reload-comparison": function (e, instance) {
    e.stopImmediatePropagation();

    var layer = this;
    console.log("Click: ", layer);

    if(!layer.isBaseImage){
      Meteor.call("templateCompareScreenshots", instance.data.screenshot._id, layer.screenshot._id, true, function (error, result) {
        if(error){
          RobaDialog.error("Screenshot comparison reload failed: " + error);
        }
      });
    }
  },

  /**
   * Remove a layer from the comparitor
   * @param e
   * @param instance
   */
  "click .test-result-screenshot-comparitor-layers .btn-delete": function (e, instance) {
    var layerId = $(e.target).closest(".sortable-table-row").attr("data-pk"),
      layers = instance.layers.get();
    if(layerId != instance.data.screenshot._id){
      delete layers[layerId];
      instance.layers.set(layers);
    }
  },

  /**
   * Show or hide a layer when the checkbox is clicked
   * @param e
   * @param instance
   */
  "change .test-result-screenshot-layer-show": function (e, instance) {
    var layerId = $(e.target).closest(".sortable-table-row").attr("data-pk"),
      checked = $(e.target).is(":checked");
    $(".test-result-screenshot[data-pk=" + layerId + "]").css("display", checked ? "block" : "none");
  },

  /**
   * Alter the opacity of a layer when the slider is changed
   * @param e
   * @param instance
   */
  "change .test-result-screenshot-layer-opacity, input .test-result-screenshot-layer-opacity": function (e, instance) {
    var layerId = $(e.target).closest(".sortable-table-row").attr("data-pk"),
      opacity = $(e.target).val();
    $(".test-result-screenshot[data-pk=" + layerId + "]").css("opacity", opacity);
  }
});

/**
 * Template Created
 */
Template.TestResultScreenshot.created = function () {
  let instance = Template.instance();
  instance.scale = new ReactiveVar(1);

  // pull in the comparison screenshots
  if(instance.data.screenshot && instance.data.screenshot._id){
    console.log("subscribing to screenshots: ", instance.data.screenshot._id);
    instance.subscribe("similar_screenshots", instance.data.screenshot._id);
    instance.subscribe("previous_version_screenshots", instance.data.screenshot._id);

    // create a storage mechanism for the image layers
    var layers = {};
    layers[instance.data.screenshot._id] = {
      screenshot: instance.data.screenshot,
      isBaseImage: true
    };
    instance.layers = new ReactiveVar(layers);
  }
};

/**
 * Template Rendered
 */
Template.TestResultScreenshot.rendered = function () {
  let instance = Template.instance();

  // make the step_types sortable
  instance.$(".test-result-screenshot-comparitor-layers").sortable({
    items: "> .sortable-table-row",
    handle: ".drag-handle",
    helper: function(e, ui) {
      // fix the width
      ui.children().each(function() {
        $(this).width($(this).width());
      });
      return ui;
    },
    axis: "y",
    distance: 5,
    forcePlaceholderSize: true,
    update: function (event, ui) {
      var baseIndex = 10;
      instance.$(".test-result-screenshot-comparitor-layers > .sortable-table-row").toArray().reverse().forEach(function (el, index) {
        var layerId = $(el).attr("data-pk");
        console.log("z-index: ", layerId, baseIndex + index);
        $(".test-result-screenshot[data-pk=" + layerId + "]").css("z-index", baseIndex + index);
      });
    }
  }).disableSelection();

  // update the sortable list when the list changes
  instance.autorun(function () {
    //console.log("TestResultScreenshot autorun");
    var layers = instance.layers.get();
    instance.$(".test-result-screenshot-comparitor-layers").sortable("refresh");
  });

  // Observe screenshot comparisons for additions
  var updateLayerComparison = function (comparison) {
    console.log("ScreenshotComparison added: ", comparison);
    var layers = instance.layers.get();
    if(layers && comparison.compareScreenshot && layers[comparison.compareScreenshot] && comparison.result && comparison.result.transform){
      console.log("ScreenshotComparison transform: ", comparison.result.transform);
      layers[comparison.compareScreenshot].transform = comparison.result.transform;
      instance.layers.set(layers);
    }
  };

  ScreenshotComparisons.find({baseScreenshot: instance.data.screenshot._id}).observe({
    added: updateLayerComparison,
    changed: updateLayerComparison
  });
};

/**
 * Template Destroyed
 */
Template.TestResultScreenshot.destroyed = function () {
  
};
