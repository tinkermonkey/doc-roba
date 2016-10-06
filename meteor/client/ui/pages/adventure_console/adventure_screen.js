import './adventure_screen.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { RobaAccordion } from 'meteor/austinsand:roba-accordion';
import { AdventureStatus } from '../../../../imports/api/adventure/adventure_status.js';
import { Actions } from '../../../../imports/api/action/action.js';
import { NodeCheckTypes } from '../../../../imports/api/node/node_check_types.js';
import './highlight_elements/highlight_element_toolbar.js';
import './highlight_elements/click_spot.js';
import './highlight_elements/highlight_element.js';
import './highlight_elements/highlight_element_detail.js';
import './hover_controls/adventure_hover_controls.js';
import './hover_controls/adventure_selector_result.js';
import './log/adventure_log_embedded.js';
import './remote_screen_pointer.js';
import './remote_screen_tools.js';

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
    }, 500);
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
   * Click event for the remote screen and screen mask
   * @param e
   * @param instance
   */
  "click .remote-screen-mask, click .remote-screen" (e, instance) {
    let context        = this,
        adventure      = context.adventure.get(),
        localViewport  = context.screenMask.get(),
        state          = context.state.get(),
        removeViewport = state.viewportSize;
    
    // make sure the adventure is operating
    if (adventure.status == AdventureStatus.complete) {
      return;
    }
    
    // filter to make sure that the click event isn't being propagated
    if (!$(e.target).hasClass("remote-screen-mask") && !$(e.target).hasClass("remote-screen")) {
      return;
    }
    
    // take the image coordinates and convert them to window coordinates
    let ratio  = removeViewport.width / localViewport.width,
        coords = {
          x: parseInt(e.offsetX * ratio),
          y: parseInt(e.offsetY * ratio)
        };
    
    // clear the last click location
    context.lastClickLocation.set(coords);
    context.setClickSpot(coords.x, coords.y, e);
    
    // clear the current highlights
    //context.selectorElements.set({});
    //context.checkResult.set();
    $(".adventure-highlight-detail").find(".selected").removeClass("selected");
    
    // execute the command
    adventure.assistant()
        .getElementAtLocation(adventure, coords.x, coords.y, (error, command) => {
          console.log("getElementAtLocation returned: ", command);
          if (error) {
            RobaDialog.error("Error adding adventure command: " + error.message);
          } else if (command && command.result && command.result.highlightElements) {
            context.highlightElements.set(command.result.highlightElements);
          }
        });
  },
  "click .adventure-selector-action-menu a" (e, instance) {
    // check for a data command
    var item        = $(e.target),
        context     = instance.data,
        currentNode = context.currentNode.get(),
        menu        = item.closest(".adventure-selector-action-menu"),
        selector    = atob(item.closest("[data-selector]").attr("data-selector")),
        command     = item.closest("[data-command]").attr("data-command"),
        commandType = item.closest("[data-command-type]").attr("data-command-type"),
        nodeId      = item.closest("[data-node-id]").attr("data-node-id"),
        targetId    = item.closest("[data-target-id]").attr("data-target-id");
    
    console.log("Select: ", commandType, command, nodeId, targetId, selector);
    
    // Need either an action targetId or a nodeId
    if (commandType && command && (nodeId || targetId) && selector) {
      // make sure the change we'll make is visible
      switch (commandType) {
        case "ready":
        case "valid":
          context.showCurrentLocation(false, () => {
            let checkType = commandType == "ready" ? NodeCheckTypes.ready : NodeCheckTypes.valid;
            
            currentNode.addCheck(checkType, command, selector, null, (error) => {
              if (error) {
                RobaDialog.error("Failed to insert NodeCheck: " + error.toString());
              }
            });
          });
          break;
        case "action":
          if (targetId) {
            $(".action-control-buttons[data-action-id='" + targetId + "'] .btn-edit-action").trigger("click");
            setTimeout(function () {
              let adventureSidebar = $(".adventure-sidebar"),
                  targetTop        = $(".edit-action-form[data-action-id='" + targetId + "']").offset().top,
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
    } else {
      console.error("Menu Select failed: ", commandType, command, nodeId, targetId, selector);
      console.error("Menu Select failed: ", item.get(0), menu.get(0));
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