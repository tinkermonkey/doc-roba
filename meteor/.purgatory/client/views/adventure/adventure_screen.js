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
    this.previewElements    = instance.previewElements.get();
    this.controlledElement  = instance.controlledElement.get();
    this.selectorElements   = instance.selectorElements; // need read/write access in the toolbar
    this.checkResult        = instance.checkResult; // track the results of selector check
    this.lastClickLocation  = instance.lastClickLocation; // track the mouse clicks

    return this;
  },

  updateViewport: function () {
    //console.log("updateViewport");
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
      width   = $(".remote-screen").width(),
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
        state = instance.data.state,
        coords;
    if(state && state.mouse && state.mouse.x >= 0 && instance.viewport.get() && state.viewportSize){
      var remoteViewport  = state.viewportSize,
        localViewport     = instance.viewport.get(),
        ratio             = (localViewport.width / remoteViewport.width),
        adjust            = $(".remote-screen").parent().offset();

      coords = {
        x: parseInt(state.mouse.x * ratio + adjust.left),
        y: parseInt(state.mouse.y * ratio + adjust.top)
      };

    }
    return coords;
  },

  /**
   * Get the elements to highlight from the last command that returned highlight elements
   * @returns [elements]
   */
  getHighlightElements: function () {
    return Template.instance().highlightElements.get()
  },

  /**
   * Get the preview elements from the last preview command
   * @returns [elements]
   */
  getPreviewElements: function () {
    return Template.instance().previewElements.get().map(function (el, i) { el.index = i; return el })
  },

  /**
   * Get the preview elements from the last preview command
   * @returns [elements]
   */
  getPreviewMatches: function () {
    if(this.matches){
      var parent = this;
      return parent.matches.map(function (el, i) {
        el.index = parent.index + "" + i;
        el.preview = parent;
        return el
      })
    }
  },

  /**
   * Get the element which the hover controls are for
   * @returns [elements]
   */
  getControlledElement: function () {
    return Template.instance().controlledElement.get()
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

      // attach the local viewport
      el.localViewport = localViewport;

      // add in the adventure and nodeId context
      el.adventure = instance.data.adventure;
      el.currentNodeId = instance.data.currentNodeId.get();

      // setup the local position of the highlight element
      el.localBounds = {
        top: parseInt( (el.bounds.top - scroll.y + el.bounds.scrollY) * ratio ),
        left: parseInt( (el.bounds.left - scroll.x + el.bounds.scrollX) * ratio ),
        height: parseInt( el.bounds.height * ratio ),
        width: parseInt( el.bounds.width * ratio )
      };

      return el;
    }
  },
  /**
   * Get the results of a selector check
   */
  getCheckResult: function () {
    return this.checkResult.get();
  },

  /**
   * Formatting for the highlight elements
   * @param item
   * @returns {Array}
   */
  splitValues: function (item) {
    var valueList = [],
      rawValueList = this.value.split(" ");
    _.each(rawValueList, function (subValue, i) {
      var context = _.omit(item, "html", "text");
      context.value = subValue.trim();
      context.last = i == rawValueList.length - 1;

      valueList.push(context);
    });
    return valueList;
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

    // clear the current highlights
    this.selectorElements.set({});
    this.checkResult.set();
    $(".adventure-highlight-detail").find(".selected").removeClass("selected");

    // send the command to get information about the "clicked" element
    Collections.AdventureCommands.insert({
      projectId: instance.data.adventure.projectId,
      adventureId: instance.data.adventure._id,
      updateState: false,
      code: "driver.getElementAtLocation(" + coords.x + "," + coords.y + ", true, true);"
    }, function (error) {
      if(error){
        console.error("Error adding adventure command: " + error.message);
        Dialog.error("Error adding adventure command: " + error.message);
      }
    });
  },
  "mouseenter .adventure-highlight-list-row-header": function (e, instance) {
    instance.$(".adventure-highlight-element.index-" + this.index).addClass("highlight");
  },
  "mouseleave .adventure-highlight-list-row-header": function (e, instance) {
    instance.$(".adventure-highlight-element.index-" + this.index).removeClass("highlight");
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
  "click .adventure-highlight-hierarchy .clickable, click .adventure-highlight-hierarchy-content .clickable": function (e, instance) {
    var context = this,
      el = $(e.target),
      selectorElements = instance.selectorElements.get();

    el.toggleClass("selected");

    // Do the rollup for this row
    var element = {
      index: context.index,
      attributes: []
    };
    el.closest(".adventure-highlight-detail").find(".selected").each(function (i, d) {
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
          console.error("clickable failure: could not identify attribute or tag: " + el.text());
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

    // make sure the adventure is operating
    if(instance.data.adventure.status == AdventureStatus.complete){
      return;
    }

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
    if(instance.hideHoverControlsTimeout){
      clearTimeout(instance.hideHoverControlsTimeout);
    }

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
  },
  "mouseenter .adventure-highlight-hierarchy": function (e, instance) {
    var localBounds = this.localBounds,
      activeElement = instance.$(".adventure-highlight-detail.active .adventure-highlight-hierarchy:last")[0];

    if(activeElement && activeElement == e.target){
      return;
    }

    // this needs to be delayed slightly to ensure any mouseleave triggers first
    if(localBounds){
      setTimeout(function () {
        instance.$(".adventure-hover-element-highlight")
          .css("visibility", "visible")
          .css("top", localBounds.top + "px")
          .css("left", localBounds.left + "px")
          .css("width", localBounds.width + "px")
          .css("height", localBounds.height + "px");
      }, 10);
    } else {
      console.error("mouseenter adventure-highlight-hierarchy without bounds");
    }
  },
  "mouseleave .adventure-highlight-hierarchy": function (e, instance) {
    instance.$(".adventure-hover-element-highlight")
      .css("top", "50%")
      .css("left", "50%")
      .css("width", "1px")
      .css("height", "1px")
      .css("visibility", "hidden");
  },
  "click .adventure-selector-action-menu a": function (e, instance) {
    // check for a data command
    var item = $(e.target),
      selector = atob(item.closest("[data-selector]").attr("data-selector")),
      command = item.closest("[data-command]").attr("data-command"),
      commandType = item.closest("[data-command-type]").attr("data-command-type"),
      nodeId = item.closest("[data-node-id]").attr("data-node-id"),
      targetId = item.closest("[data-target-id]").attr("data-target-id");

    console.log("Select: ", commandType, command, nodeId, targetId, selector);

    // make sure the change we'll make is visible
    switch (commandType) {
      case "ready":
      case "valid":
        Accordion.activate("current-node");
        setTimeout(function () {
          var targetTop = $(".node-edit-form").offset().top,
            currentScroll = $(".adventure-sidebar").scrollTop(),
            sidebarTop = $(".adventure-sidebar").offset().top;
          $(".adventure-sidebar").animate({scrollTop: targetTop + currentScroll - 10 - sidebarTop}, 200, function () {
            var field = commandType == "ready" ? "readyCode" : "validationCode",
              update = {$set: {}},
              node = Collections.Nodes.findOne(nodeId);
            if(node[field] && node[field].length){
              update.$set[field] = node[field] + "\n" + commandType + "." + command + "('" + selector + "');";
            } else {
              update.$set[field] = commandType + "." + command + "('" + selector + "');";
            }
            Collections.Nodes.update(nodeId, update, function (error, result) {
              if(error){
                console.error("Failed to update node value: " + error.message);
                Dialog.error("Failed to update node value: " + error.message);
                console.log("Attempted update:", update);
              }
            });
          });
        }, 250);
        break;
      case "action":
        Accordion.activate("current-node-actions");
        if(targetId){
          $(".action-control-buttons[data-action-id='" + targetId + "'] .btn-edit-action").trigger("click");
          setTimeout(function () {
            var targetTop = $(".action-edit-form[data-action-id='" + targetId + "']").offset().top,
              currentScroll = $(".adventure-sidebar").scrollTop(),
              sidebarTop = $(".adventure-sidebar").offset().top;
            $(".adventure-sidebar").animate({scrollTop: targetTop + currentScroll - 10 - sidebarTop}, 200, function () {
              var action = Collections.Actions.findOne(targetId),
                update = {$set: {}};
              if(action.code && action.code.length){
                update.$set.code = action.code + "\n" + "driver." + command + "('" + selector + "');";
              } else {
                update.$set.code  = "driver." + command + "('" + selector + "');";
              }
              Collections.Actions.update(targetId, update, function (error, result) {
                if(error){
                  console.error("Failed to update action value: " + error.message);
                  Dialog.error("Failed to update action value: " + error.message);
                  console.log("Attempted update:", update);
                }
              });
            });
          }, 250);
        }
        break;
    }
  }
});

/**
 * Create reactive vars for this instance
 */
Template.AdventureScreen.created = function () {
  var instance = Template.instance();
  instance.viewport           = new ReactiveVar();
  instance.highlightElements  = new ReactiveVar([]);
  instance.previewElements    = new ReactiveVar([]);
  instance.selectorElements   = new ReactiveVar({});
  instance.controlledElement  = new ReactiveVar();
  instance.checkResult        = new ReactiveVar();
  instance.lastClickLocation  = new ReactiveVar();

  instance.updateViewport = function () {
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
  Collections.AdventureCommands.find({
    adventureId: instance.data.adventure._id,
    "result.highlightElements": {$exists: true}
  }, {sort: {dateCreated: -1}, limit: 1}).observe({
    addedAt: function (command) {
      if(command && command.result && command.result.highlightElements){
        _.each(command.result.highlightElements, function (d, i) {d.index = i;});
        if(command.result.preview){
          instance.previewElements.set(command.result.highlightElements);
          instance.highlightElements.set([]);
        } else {
          instance.highlightElements.set(command.result.highlightElements);
          instance.previewElements.set([]);
        }
      }
    },
    changedAt: function (command) {
      if(command && command.result && command.result.highlightElements){
        _.each(command.result.highlightElements, function (d, i) {d.index = i;});
        if(command.result.preview){
          instance.previewElements.set(command.result.highlightElements);
          instance.highlightElements.set([]);
        } else {
          instance.highlightElements.set(command.result.highlightElements);
          instance.previewElements.set([]);
        }
      }
    }
  });
};

/**
 * React to the template being destroyed
 */
Template.AdventureScreen.destroyed = function () {
};