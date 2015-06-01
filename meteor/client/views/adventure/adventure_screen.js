/**
 * Template helpers
 */
Template.AdventureScreen.helpers({
  /**
   * Provide a full context including the instance ReactiveVar values
   * @returns {*}
   */
  fullContext: function () {
    var instance = Template.instance();
    this.viewport           = instance.viewport.get();
    this.highlightElements  = instance.highlightElements.get();
    this.controlledElement  = instance.controlledElement.get();
    this.selectorElements   = instance.selectorElements; // need read/write access in the toolbar
    this.lastClickLocation  = instance.lastClickLocation; // track the mouse clicks

    return this;
  },
  updateViewport: function () {
    console.log("updateViewport");
    var instance = Template.instance();
    Meteor.setTimeout(instance.updateViewport, 1000);
  },
  /**
   * Get the coordinates for the screen shot mask
   * @returns {{top: number, left: number, height: number, width: number}}
   */
  getScreenMaskPosition: function () {
    var instance = Template.instance(),
      localViewport = instance.viewport.get(),
      width = $(".remote-screen").width(),
      height  = $(".remote-screen").height(),
      offset  = $(".remote-screen").offset(),
      adjust  = $(".remote-screen").parent().offset();

    if(offset && adjust){
      return {
        top: offset.top - adjust.top,
        left: offset.left - adjust.left,
        height: height,
        width: width
      };
    }
  },
  /**
   * Get the local coordinates of the remove mouse
   */
  getMousePosition: function () {
    var instance = Template.instance(),
      coords = { x: 0, y: 0};
    if(instance.data.state && instance.data.state.mouse && instance.data.state.mouse.x >= 0 && instance.viewport.get() && instance.data.state.viewportSize){
      var remoteViewport  = instance.data.state.viewportSize,
        localViewport     = instance.viewport.get(),
        ratio             = (localViewport.width / remoteViewport.width),
        adjust            = $(".remote-screen").parent().offset();

      coords = {
        x: parseInt(instance.data.state.mouse.x * ratio + adjust.left),
        y: parseInt(instance.data.state.mouse.y * ratio + adjust.top)
      };

    }
    return coords;
  },
  /**
   * Get the elements to highlight from the last command that returned highlight elements
   * @returns [elements]
   */
  getHighlightElements: function () {
    var instance = Template.instance();
    return instance.highlightElements.get();
  },
  /**
   * Get the element which the hover controls are for
   * @returns [elements]
   */
  getControlledElement: function () {
    var instance = Template.instance();
    return instance.controlledElement.get();
  },
  /**
   * Process a highlight element into something usable
   * @returns {*}
   */
  processHighlightElement: function () {
    var el = this,
      instance        = Template.instance(),
      localViewport   = instance.viewport.get(),
      remoteViewport  = instance.data.state.viewportSize,
      scroll          = instance.data.state.scroll;

    // convert the bounds of the highlight element from remote to local coordinates
    if(el.bounds && localViewport && remoteViewport){
      var ratio = (localViewport.width / remoteViewport.width);

      // attache the local viewport
      el.localViewport = localViewport;

      // setup the local position of the highlight element
      el.localBounds = {
        top: parseInt( (el.bounds.top - scroll.y + el.bounds.scrollY) * ratio ),
        left: parseInt( (el.bounds.left - scroll.x + el.bounds.scrollX) * ratio ),
        height: parseInt( el.bounds.height * ratio ),
        width: parseInt( el.bounds.width * ratio )
      };

      return el;
    }
  }
});

/**
 * Event handlers
 */
Template.AdventureScreen.events({
  /**
   * Click event for the drone screen and screen mask
   * @param e
   */
  "click .remote-screen-mask, click .remote-screen": function (e, instance) {
    // make sure the adventure is operating
    if(instance.data.adventure.status == AdventureStatus.complete){
      return;
    }

    // filter to make sure that the click event isn't being propagated
    if(!$(e.target).hasClass("remote-screen-mask") && !$(e.target).hasClass("remote-screen")){
      console.log("Mask Click: ignoring propagated event");
      return;
    }

    // take the image coordinates and convert them to window coordinates
    var viewport = instance.data.state.viewportSize,
      bounds = { width: $(e.target).width(), height: $(e.target).height()},
      ratio  = (viewport.width / bounds.width),
      coords = {
        x: parseInt(e.offsetX * ratio),
        y: parseInt(e.offsetY * ratio)
      };

    // clear the last click location
    this.lastClickLocation.set({x: coords.x, y: coords.y});

    // send the command to get information about the "clicked" element
    AdventureCommands.insert({
      projectId: instance.data.adventure.projectId,
      adventureId: instance.data.adventure._id,
      updateState: false,
      code: "driver.getElementAtLocation(" + coords.x + "," + coords.y + ", true, true);"
    }, function (error) {
      if(error){
        Meteor.log.error("Error adding adventure command: " + error.message);
        Dialog.error("Error adding adventure command: " + error.message);
      }
    });
  },
  /**
   * Click event for the refresh button
   * @param e
   */
  "click .btn-refresh": function (e, instance) {
    // make sure the adventure is operating
    if(instance.data.adventure.status == AdventureStatus.complete){
      return;
    }

    // send the command to clear all of the highlighted elements
    AdventureCommands.insert({
      projectId: instance.data.adventure.projectId,
      adventureId: instance.data.adventure._id,
      updateState: true,
      code: "true"
    }, function (error) {
      if(error){
        Meteor.log.error("Error adding adventure command: " + error.message);
        Dialog.error("Error adding adventure command: " + error.message);
      }
    });
  },
  /**
   * Click event for the clear-highlight button
   * @param e
   */
  "click .btn-clear-highlight": function (e, instance) {
    // make sure the adventure is operating
    if(instance.data.adventure.status == AdventureStatus.complete){
      return;
    }

    // clear the last click location
    this.lastClickLocation.set();

    // send the command to clear all of the highlighted elements
    AdventureCommands.insert({
      projectId: instance.data.adventure.projectId,
      adventureId: instance.data.adventure._id,
      updateState: false,
      code: "driver.clearHighlight();"
    }, function (error) {
      if(error){
        Meteor.log.error("Error adding adventure command: " + error.message);
        Dialog.error("Error adding adventure command: " + error.message);
      }
    });
  },
  /**
   * Click event for the highlight element list toggle
   * @param e
   */
  "click .adventure-highlight-list-row-header, click .detail-toggle": function (e, instance) {
    $(e.target).closest("td").find(".adventure-highlight-list-row-detail").toggleClass("active");
    $(e.target).closest("td").find(".detail-toggle").toggleClass("glyphicon-chevron-up");
    $(e.target).closest("td").find(".detail-toggle").toggleClass("glyphicon-chevron-down");
  },
  /**
   * Click one of the selectable xpath components
   * @param e
   * @param instance
   */
  "click .adventure-highlight-hierarchy .clickable": function (e, instance) {
    var context = this,
      el = $(e.target),
      selectorElements = instance.selectorElements.get();

    el.toggleClass("selected");

    // Do the rollup for this row
    var element = {
      index: context.index,
      attributes: []
    };
    el.closest(".adventure-highlight-hierarchy").find(".selected").each(function (i, d) {
      if($(d).hasClass("tag")){
        element.tag = $(d).text().trim();
      } else {
        var attribute = $(d).prevAll(".attr").first(),
          value = $(d).text().trim();

        if(attribute && attribute.text()){
          element.attributes.push({
            attribute: attribute.text().trim(),
            value: value
          });
        } else {
          Meteor.log.error("clickable failure: could not identify attribute or tag: " + el.text());
          Dialog.error("clickable failure: could not identify attribute or tag: " + el.text());
        }
      }
    });

    // update the selector elements
    var index = ("0000" + parseInt(element.index)).slice(-4);
    if(element.tag || element.attributes.length){
      // set the element
      selectorElements["_" + index] = element;
    } else {
      // make sure the element is nulled
      delete selectorElements["_" + index];
    }

    // sort by index
    var sortedElements = {};
    _.each(_.sortBy(_.keys(selectorElements), function (key) { return selectorElements[key].index }), function (key) {
      sortedElements[key] = selectorElements[key];
    });

    // done
    //console.log("updating elements: ", sortedElements);
    instance.selectorElements.set(sortedElements);
  },
  /**
   * Show the hover controls for a highlight element
   */
  "mouseenter .adventure-highlight-element": function (e, instance) {
    var element = this;

    clearTimeout(instance.hideHoverControlsTimeout);

    //console.log("mouseenter: ", element);
    var hoverContainer = instance.$(".hover-controls-container");
    if(element.localBounds && hoverContainer){
      hoverContainer
        .css("top", element.localBounds.top - 40)
        .css("left", element.localBounds.left)
        .css("display", "block");
      instance.controlledElement.set(element);
    }
  },
  /**
   * Hide the hover controls
   */
  "mouseleave .adventure-highlight-element, mouseleave .hover-controls-container": function (e, instance) {
    var context = this;
    //console.log("mouseleave: ", context);
    instance.hideHoverControlsTimeout = setTimeout(function () {
      delete instance.hideHoverControlsTimeout;
      instance.$(".hover-controls-container").css("display", "");
      instance.controlledElement.set();
    }, 500);
  },
  /**
   * Hide the hover controls
   */
  "mouseenter .hover-controls-container": function (e, instance) {
    clearTimeout(instance.hideHoverControlsTimeout);
  }
});

/**
 * Create reactive vars for this instance
 */
Template.AdventureScreen.created = function () {
  var instance = Template.instance();
  instance.viewport           = new ReactiveVar();
  instance.highlightElements  = new ReactiveVar();
  instance.selectorElements   = new ReactiveVar({});
  instance.controlledElement  = new ReactiveVar();
  instance.lastClickLocation  = new ReactiveVar();

  instance.updateViewport = function () {
    console.log("Updating viewport");
    var viewport = {
      width: $(".remote-screen").width(),
      height: $(".remote-screen").height(),
      offset: $(".remote-screen").offset(),
      parentOffset: $(".remote-screen").offsetParent().offset()
    };

    viewport.parentOffset.height = $(".remote-screen").offsetParent().height();
    viewport.parentOffset.width = $(".remote-screen").offsetParent().width();

    instance.viewport.set(viewport);
  }
};

/**
 * React to the template being rendered
 */
Template.AdventureScreen.rendered = function () {
  var instance = Template.instance();

  // Setup the console view
  instance.autorun(function () {
    var resize = Session.get("resize");
    instance.updateViewport();
  });

  // Observe the commands to pick up the highlight elements
  AdventureCommands.find({
    adventureId: instance.data.adventure._id,
    "result.highlightElements": {$exists: true}
  }, {sort: {dateCreated: -1}, limit: 1}).observe({
    addedAt: function (command) {
      //console.log("Command added: ", command);
      if(command && command.result && command.result.highlightElements){
        _.each(command.result.highlightElements, function (d, i) {d.index = i;});
        instance.highlightElements.set(command.result.highlightElements);
      }
    },
    changedAt: function (command) {
      console.log("Command changed: ", command);
      if(command && command.result && command.result.highlightElements){
        _.each(command.result.highlightElements, function (d, i) {d.index = i;});
        instance.highlightElements.set(command.result.highlightElements);
      }
    }
  });
};

/**
 * React to the template being destroyed
 */
Template.AdventureScreen.destroyed = function () {
};