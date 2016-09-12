import './adventure_screen.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureStatus } from '../../../../imports/api/adventure/adventure_status.js';
import { Actions } from '../../../../imports/api/action/action.js';
import { Nodes } from '../../../../imports/api/node/node.js';
import './highlight/adventure_highlight_element.js';
import './highlight/adventure_highlight_detail.js';
import './hover_controls/adventure_hover_controls.js';
import './log/adventure_log_embedded.js';
import './highlight/adventure_preview_element.js';
import './hover_controls/adventure_selector_result.js';
import './adventure_toolbar.js';

/**
 * Template helpers
 */
Template.AdventureScreen.helpers({
  /**
   * Update the local viewport dimensions
   */
  updateViewport () {
    //console.log("updateViewport");
    let context = this;
    setTimeout(() => {
      context.updateViewport();
    }, 1000);
  },
  
  /**
   * Get the coordinates for the screen shot mask
   * @returns {{top: number, left: number, height: number, width: number}}
   */
  getScreenMaskPosition () {
    let viewport = this.viewport.get();
    if (viewport && viewport.offset) {
      return {
        top   : viewport.offset.top - viewport.parentOffset.top,
        left  : viewport.offset.left - viewport.parentOffset.left,
        height: viewport.height,
        width : viewport.width
      };
    }
  },
  /**
   * Get the local coordinates of the remove mouse
   */
  getMousePosition () {
    let viewport = this.viewport.get(),
        state    = this.state.get(),
        coords;
    if (state && state.mouse && state.mouse.x >= 0 && viewport && state.viewportSize) {
      let remoteViewport = state.viewportSize,
          ratio          = (viewport.width / remoteViewport.width),
          adjust         = $(".remote-screen").parent().offset();
      
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
  getHighlightElements () {
    return this.highlightElements.get()
  },
  
  /**
   * Get the preview elements from the last preview command
   * @returns [elements]
   */
  getPreviewElements () {
    return this.previewElements.get().map(function (el, i) {
      el.index = i;
      return el
    })
  },
  
  /**
   * Get the preview elements from the last preview command
   * @returns [elements]
   */
  getPreviewMatches () {
    if (this.matches) {
      let parent = this;
      return parent.matches.map(function (el, i) {
        el.index   = parent.index + "" + i;
        el.preview = parent;
        return el
      })
    }
  },
  
  /**
   * Get the element which the hover controls are for
   * @returns [elements]
   */
  getControlledElement () {
    return this.controlledElement.get()
  },
  
  /**
   * Process a highlight element into something usable
   * @returns {*}
   */
  processHighlightElement (index) {
    let element        = this,
        context        = Template.parentData(1),
        localViewport  = context.viewport.get(),
        state          = context.state.get(),
        remoteViewport = state.viewportSize,
        scroll         = state.scroll;
    
    // convert the bounds of the highlight element from remote to local coordinates
    if (element.bounds && localViewport && remoteViewport) {
      let ratio = (localViewport.width / remoteViewport.width);
      // encode the array index
      element.index = index;
      
      // attach the local viewport
      element.localViewport = localViewport;
      
      // add in the adventure and nodeId context
      element.adventure     = context.adventure.get();
      element.currentNodeId = context.currentNodeId.get();
      
      // setup the local position of the highlight element
      element.localBounds = {
        top   : parseInt((element.bounds.top - scroll.y + element.bounds.scrollY) * ratio),
        left  : parseInt((element.bounds.left - scroll.x + element.bounds.scrollX) * ratio),
        height: parseInt(element.bounds.height * ratio),
        width : parseInt(element.bounds.width * ratio)
      };
      
      return element;
    }
  },
  /**
   * Get the results of a selector check
   */
  getCheckResult () {
    return this.checkResult.get();
  },
  
  /**
   * Formatting for the highlight elements
   * @param item
   * @returns {Array}
   */
  splitValues (item) {
    let valueList    = [],
        rawValueList = this.value.split(" ");
    _.each(rawValueList, function (subValue, i) {
      let context   = _.omit(item, "html", "text");
      context.value = subValue.trim();
      context.last  = i == rawValueList.length - 1;
      
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
   * @param instance
   */
  "click .remote-screen-mask, click .remote-screen" (e, instance) {
    let adventure = instance.data.adventure.get(),
        state     = instance.data.state.get();
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    // filter to make sure that the click event isn't being propagated
    if (!$(e.target).hasClass("remote-screen-mask") && !$(e.target).hasClass("remote-screen")) {
      return;
    }
    
    // take the image coordinates and convert them to window coordinates
    let viewport = state.viewportSize,
        bounds   = { width: $(e.target).width(), height: $(e.target).height() },
        ratio    = (viewport.width / bounds.width),
        coords   = {
          x: parseInt(e.offsetX * ratio),
          y: parseInt(e.offsetY * ratio)
        };
    
    // clear the last click location
    this.lastClickLocation.set({ x: coords.x, y: coords.y });
    
    // clear the current highlights
    this.selectorElements.set({});
    this.checkResult.set();
    $(".adventure-highlight-detail").find(".selected").removeClass("selected");
    
    // execute the command
    adventure.assistant()
        .getElementAtLocation(adventure, coords.x, coords.y, (error, command) => {
          if (error) {
            RobaDialog.error("Error adding adventure command: " + error.message);
          } else if (command && command.result && command.result.highlightElements) {
            instance.data.highlightElements.set(command.result.highlightElements);
          }
        });
  },
  "mouseenter .adventure-highlight-list-row-header" (e, instance) {
    instance.$(".adventure-highlight-element.index-" + this.index).addClass("highlight");
  },
  "mouseleave .adventure-highlight-list-row-header" (e, instance) {
    instance.$(".adventure-highlight-element.index-" + this.index).removeClass("highlight");
  },
  /**
   * Click event for the highlight element list toggle
   * @param e
   */
  "click .adventure-highlight-list-row-header, click .detail-toggle" (e, instance) {
    let cell   = $(e.target).closest("td"),
        toggle = cell.find(".detail-toggle");
    
    cell.find(".adventure-highlight-list-row-detail").toggleClass("active");
    toggle.toggleClass("glyphicon-chevron-up");
    toggle.toggleClass("glyphicon-chevron-down");
  },
  /**
   * Click one of the selectable xpath components
   * @param e
   * @param instance
   */
  "click .adventure-highlight-hierarchy .clickable, click .adventure-highlight-hierarchy-content .clickable" (e, instance) {
    var context          = this,
        el               = $(e.target),
        selectorElements = instance.data.selectorElements.get();
    
    el.toggleClass("selected");
    
    // Do the rollup for this row
    var element = {
      index     : context.index,
      attributes: []
    };
    el.closest(".adventure-highlight-detail").find(".selected").each(function (i, detailEl) {
      let detail = $(detailEl);
      
      if (detail.hasClass("tag")) {
        element.tag = detail.text().trim();
      } else {
        let attribute = detail.prevAll(".attr").first(),
            value     = detail.text().trim();
        
        if (attribute && attribute.text()) {
          element.attributes.push({
            attribute: attribute.text().trim(),
            value    : value
          });
        } else {
          RobaDialog.error("clickable failure: could not identify attribute or tag: " + el.text());
        }
      }
    });
    
    // update the selector elements
    var index = ("0000" + parseInt(element.index)).slice(-4);
    if (element.tag || element.attributes.length) {
      // set the element
      selectorElements[ "_" + index ] = element;
    } else {
      // make sure the element is nulled
      delete selectorElements[ "_" + index ];
    }
    
    // sort by index
    var sortedElements = {};
    _.each(_.sortBy(_.keys(selectorElements), (key) => {
      return selectorElements[ key ].index
    }), (key) => {
      sortedElements[ key ] = selectorElements[ key ];
    });
    
    // done
    //console.log("updating elements: ", sortedElements);
    instance.data.selectorElements.set(sortedElements);
  },
  
  /**
   * Show the hover controls for a highlight element
   */
  "mouseenter .adventure-highlight-element" (e, instance) {
    let element        = this,
        adventure      = instance.data.adventure.get(),
        hoverContainer = instance.$(".hover-controls-container");
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    clearTimeout(instance.hideHoverControlsTimeout);
    
    //console.log("mouseenter: ", element);
    if (element.localBounds && hoverContainer) {
      hoverContainer
          .css("top", element.localBounds.top - 40)
          .css("left", element.localBounds.left)
          .css("display", "block");
      
      instance.data.controlledElement.set(element);
    }
  },
  /**
   * Hide the hover controls
   */
  "mouseleave .adventure-highlight-element, mouseleave .hover-controls-container" (e, instance) {
    if (instance.hideHoverControlsTimeout) {
      clearTimeout(instance.hideHoverControlsTimeout);
    }
    
    instance.hideHoverControlsTimeout = setTimeout(function () {
      delete instance.hideHoverControlsTimeout;
      instance.$(".hover-controls-container").css("display", "");
      instance.data.controlledElement.set();
    }, 500);
  },
  /**
   * Hide the hover controls
   */
  "mouseenter .hover-controls-container" (e, instance) {
    clearTimeout(instance.hideHoverControlsTimeout);
  },
  "mouseenter .adventure-highlight-hierarchy" (e, instance) {
    var localBounds   = this.localBounds,
        activeElement = instance.$(".adventure-highlight-detail.active .adventure-highlight-hierarchy:last")[ 0 ];
    
    if (activeElement && activeElement == e.target) {
      return;
    }
    
    // this needs to be delayed slightly to ensure any mouseleave triggers first
    if (localBounds) {
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
  "mouseleave .adventure-highlight-hierarchy" (e, instance) {
    instance.$(".adventure-hover-element-highlight")
        .css("top", "50%")
        .css("left", "50%")
        .css("width", "1px")
        .css("height", "1px")
        .css("visibility", "hidden");
  },
  "click .adventure-selector-action-menu a" (e, instance) {
    // check for a data command
    var item        = $(e.target),
        selector    = atob(item.closest("[data-selector]").attr("data-selector")),
        command     = item.closest("[data-command]").attr("data-command"),
        commandType = item.closest("[data-command-type]").attr("data-command-type"),
        nodeId      = item.closest("[data-node-id]").attr("data-node-id"),
        targetId    = item.closest("[data-target-id]").attr("data-target-id");
    
    console.log("Select: ", commandType, command, nodeId, targetId, selector);
    
    // make sure the change we'll make is visible
    switch (commandType) {
      case "ready":
      case "valid":
        Accordion.activate("current-node");
        setTimeout(function () {
          let adventureSidebar = $(".adventure-sidebar"),
              targetTop        = $(".node-edit-form").offset().top,
              currentScroll    = adventureSidebar.scrollTop(),
              sidebarTop       = adventureSidebar.offset().top;
          
          adventureSidebar.animate({ scrollTop: targetTop + currentScroll - 10 - sidebarTop }, 200, function () {
            var field  = commandType == "ready" ? "readyCode" : "validationCode",
                update = { $set: {} },
                node   = Nodes.findOne(nodeId);
            if (node[ field ] && node[ field ].length) {
              update.$set[ field ] = node[ field ] + "\n" + commandType + "." + command + "('" + selector + "');";
            } else {
              update.$set[ field ] = commandType + "." + command + "('" + selector + "');";
            }
            Nodes.update(nodeId, update, function (error, result) {
              if (error) {
                RobaDialog.error("Failed to update node value: " + error.message);
                console.error("Attempted update:", update);
              }
            });
          });
        }, 250);
        break;
      case "action":
        Accordion.activate("current-node-actions");
        if (targetId) {
          $(".action-control-buttons[data-action-id='" + targetId + "'] .btn-edit-action").trigger("click");
          setTimeout(function () {
            let adventureSidebar = $(".adventure-sidebar"),
                targetTop        = $(".action-edit-form[data-action-id='" + targetId + "']").offset().top,
                currentScroll    = adventureSidebar.scrollTop(),
                sidebarTop       = adventureSidebar.offset().top;
            
            adventureSidebar
                .animate({ scrollTop: targetTop + currentScroll - 10 - sidebarTop }, 200, function () {
                  var action = Actions.findOne(targetId),
                      update = { $set: {} };
                  if (action.code && action.code.length) {
                    update.$set.code = action.code + "\n" + "driver." + command + "('" + selector + "');";
                  } else {
                    update.$set.code = "driver." + command + "('" + selector + "');";
                  }
                  Actions.update(targetId, update, function (error, result) {
                    if (error) {
                      RobaDialog.error("Failed to update action value: " + error.message);
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
Template.AdventureScreen.onCreated(() => {
});

/**
 * React to the template being rendered
 */
Template.AdventureScreen.onRendered(() => {
});

/**
 * React to the template being destroyed
 */
Template.AdventureScreen.onDestroyed(() => {
});