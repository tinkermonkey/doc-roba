/**
 * Template Helpers
 */
Template.popover.helpers({
  /**
   * Get the envelope in which to place the popover
   */
  getEnvelope: function () {
    var screenSize = Session.get("resize"),
      margin = this.margin || 20;

    // otherwise use the full screen
    this.envelope = {
      top: margin,
      left: margin,
      width: screenSize.width - 2 * margin,
      height: screenSize.height - 2 * margin
    };

    // autoposition if there is a source-element
    if (this.sourceElement) {
      var bounds  = Util.getScreenBounds(this.sourceElement),
        placement = this.placement || "right";

      // if the placement is auto, figure out the real placement
      if(placement == "auto"){
        var options = [
          {
            placement: "top",
            area: screenSize.width * bounds.top
          },{
            placement: "right",
            area: screenSize.height * (screenSize.width - (bounds.left + bounds.width))
          },{
            placement: "bottom",
            area: screenSize.width * (screenSize.height - (bounds.top + bounds.height))
          },{
            placement: "left",
            area: screenSize.height * bounds.left
          }
        ];
        placement = _.sortBy(options, function (option) {return -1 * option.area })[0].placement;
      }

      // calculate the placement
      switch(placement){
        case "top":
          this.envelope.height = bounds.top - 2 * margin;
          break;
        case "right":
          this.envelope.left = parseInt(bounds.left + bounds.width) + margin;
          this.envelope.width = screenSize.width - 2 * margin - parseInt(bounds.left + bounds.width);
          break;
        case "bottom":
          this.envelope.top = parseInt(bounds.top + bounds.height) + margin;
          this.envelope.height = screenSize.height - 2 * margin - parseInt(bounds.top + bounds.height);
          break;
        case "left":
          this.envelope.width = bounds.left - 2 * margin;
          break;
      }
    } else if(this.top != undefined && this.left != undefined) {
      this.envelope = {
        top: this.top,
        left: this.left,
        width: screenSize.width - this.left - margin,
        height: screenSize.height - this.top - margin
      };
    }

    return _.map(this.envelope, function (value, key) { return key + ": " + parseInt(value) + "px;" });
  },
  /**
   * Get the position of the popover within the envelope
   */
  getPosition: function () {
    // auto-position if there is a source-element
    if (this.sourceElement) {
      console.log("popover getPosition:", this);
      var position = {
            width: this.width,
            height: this.height,
            "min-width": this.minWidth,
            "min-height": this.minHeight,
            "max-width": this.maxWidth,
            "max-height": this.maxHeight
          },
          margin    = this.margin || 20,
          bounds    = Util.getScreenBounds(this.sourceElement),
          placement = this.placement || "right";

      position["max-width"]  = position["max-width"]  || this.envelope.width - margin;
      position["max-height"] = position["max-height"] || this.envelope.height - margin;

      if(this.size == "maximize"){
        position.height = this.envelope.height;
        position.width  = this.envelope.width;
      } else {
        // calculate the placement
        switch(placement){
          case "top":
            position.bottom = 0;
            position.left = bounds.left - margin;
            break;
          case "right":
            position.top = bounds.top - margin;
            break;
          case "bottom":
            position.left = bounds.left - margin;
            break;
          case "left":
            position.top = bounds.top - margin;
            position.right = 0;
            break;
        }
      }
    } else if(this.top != undefined && this.left != undefined) {
      position.top  = this.top;
      position.left = this.left;
    } else {
      // otherwise center it
      position = {
        top: "50%",
        left: "50%",
        "margin-left": -1 * (this.width / 2) + "px",
        "margin-top": "-150px"
      };
    }

    return _.map(position, function (value, key) {
      if(value){
        if(typeof value == "string"){
          return key + ": " + value + ";";
        } else {
          return key + ": " + parseInt(value) + "px;";
        }
      } else {
        return '';
      }
    });
  }
});

/**
 * Template Helpers
 */
Template.popover.events({
  "click .button-bar button": function (e, instance) {
    var btn = $(e.target).text();

    console.debug("Popover button clicked: " + btn, instance);
    if (instance.data.callback) {
      instance.data.callback(btn, instance);
    }
  }
});

/**
 * Template Destroyed
 */
Template.popover.created = function () {
};

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
 */
Popover = {
  /**
   * Show a popover
   * @param options
   */
  show: function (options) {

    // Combine the options with the defaults
    _.defaults(options, {
      width: 400,
      envelope: {},
      callback: function () {
        console.log("Popover closed");
      }.bind(this)
    });

    // hide the existing popover if it exists
    if(Popover.currentInstance){
      Popover.hide(function () {
        Blaze.renderWithData(Template.popover, options, $("body")[0]);
        $(document).bind("mouseup", Popover.clickHandler);
      });
    } else {
      Blaze.renderWithData(Template.popover, options, $("body")[0]);
      $(document).bind("mouseup", Popover.clickHandler);
    }
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
    //console.log("popover click handler: ");
    var container = $(".dr-popover");
    if(!container.is(e.target) && container.has(e.target).length === 0 && Popover.currentInstance){
      Popover.hide(Popover.currentInstance.data.callback);
    }
  }
};
