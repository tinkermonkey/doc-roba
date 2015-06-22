/**
 * Template Helpers
 */
Template.popover.helpers({
  getPosition: function () {
    var position;

    // get the position of the source element
    if (this.sourceElement) {
      var source = $(this.sourceElement),
        offset = source.offset(),
        width = source.outerWidth(),
        margin = 20;

      if(source.closest("svg").length){
        width = source[0].getBoundingClientRect().width;
      }

      position = "top: " + parseInt(offset.top - margin) + "px; left: " + parseInt(offset.left + width - margin + 20) + "px;";
    } else {
      // otherwise center it
      position = "top:50%; left:50%; margin-left:-" + (this.width / 2) + "px; margin-top:-150px;";
    }

    // if width is specified, use it
    if (this.width) {
      position += "width:" + parseInt(this.width) + "px;";
    }

    return position;
  }
});

/**
 * Template Helpers
 */
Template.popover.events({

});

/**
 * Template Rendered
 */
Template.popover.rendered = function () {
  var instance = Popover.currentInstance = Template.instance(),
    popover = instance.$(".dr-popover");

  instance.autorun(function () {
    // This should re-run if the window height changes
    var resize = Session.get("resize");

    // reposition the popover after a reasonable delay to allow for repositioning of the attached element
  });
};

/**
 * Template Destroyed
 */
Template.popover.destroyed = function () {

};


/**
 * Create a singleton for interacting with the popover
 * There will only be one visible at a time
 * @type {{}}
 */
Popover = {
  /**
   * Show a popover
   * @param template The template showing the content
   * @param options
   */
  show: function (options) {
    // Combine the options with the defaults
    _.defaults(options, {
      width: 400,
      maxWidth: 1000,
      callback: function () {
        console.log("Popover closed");
      }.bind(this)
    });

    Blaze.renderWithData(Template.popover, options, $("body")[0]);

    // add a click handler to hide the popover
    $(document).bind("mouseup", Popover.clickHandler);
  },

  /**
   * Hide the popover and call a function upon completion
   * @param callback
   */
  hide: function (callback) {
    if(Popover.currentInstance){
      var popover = $(".dr-popover");

      // Fade out and destroy the template
      popover.fadeOut(250, function () {
        Blaze.remove(Popover.currentInstance.view);
        delete Popover.currentInstance;

        // remove the popover click handler
        $(document).unbind("mouseup", Popover.clickHandler);

        if(callback){
          callback();
        }
      });
    }
  },

  /**
   * Global click handler to hide the popover when clicked outside of it
   * @param e
   */
  clickHandler: function (e) {
    console.log("popover click handler: ");
    var container = $(".dr-popover");
    if(!container.is(e.target) && container.has(e.target).length === 0 && Popover.currentInstance){
      Popover.hide(Popover.currentInstance.data.callback);
    }
  }
};
