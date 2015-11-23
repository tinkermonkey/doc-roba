/**
 * Template Helpers
 */
Template.FullscreenViewer.helpers({});

/**
 * Template Event Handlers
 */
Template.FullscreenViewer.events({
  "click .dr-fullscreen-viewer": function (e, instance) {
    console.log("Click: ", e.target);
    if($(e.target).hasClass("dr-fullscreen-viewer")){
      FullscreenViewer.hide();
    }
  }
});

/**
 * Template Created
 */
Template.FullscreenViewer.created = function () {
};

/**
 * Template Rendered
 */
Template.FullscreenViewer.rendered = function () {
  var instance = FullscreenViewer.currentInstance = Template.instance();
};

/**
 * Template Destroyed
 */
Template.FullscreenViewer.destroyed = function () {
  
};

/**
 * Singleton for interacting with the fulscreen viewer
 * There will only ever be one visible at a given time
 */
FullscreenViewer = {
  /**
   * Show an FullscreenViewer
   * @param options
   */
  show: function (options) {

    // Combine the options with the defaults
    _.defaults(options, {
      callback: function () {
        console.log("FullscreenViewer closed");
      }.bind(this)
    });

    // hide the existing FullscreenViewer if it exists
    if(FullscreenViewer.currentInstance){
      FullscreenViewer.hide(function () {
        Blaze.renderWithData(Template.FullscreenViewer, options, $("body")[0]);
        //$(document).bind("mouseup", FullscreenViewer.clickHandler);
      });
    } else {
      Blaze.renderWithData(Template.FullscreenViewer, options, $("body")[0]);
      //$(document).bind("mouseup", FullscreenViewer.clickHandler);
    }
  },

  /**
   * Hide the FullscreenViewer and call a function upon completion
   * @param callback
   */
  hide: function (callback) {
    console.log("FullscreenViewer.hide()");
    if(FullscreenViewer.currentInstance){
      var fullscreenViewer = $(".dr-fullscreen-viewer");

      // Fade out and destroy the template
      fullscreenViewer.fadeOut(250, function () {
        Blaze.remove(FullscreenViewer.currentInstance.view);
        delete FullscreenViewer.currentInstance;

        if(callback){
          callback();
        }
      });
    }
  }
};