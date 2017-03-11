import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Adventures } from '../../../../imports/api/adventures/adventures.js';
import { AdventureStates } from '../../../../imports/api/adventures/adventure_states.js';
import { Nodes } from '../../../../imports/api/nodes/nodes.js';
import { TestSystems } from '../../../../imports/api/test_systems/test_systems.js';
import { Util } from '../../../../imports/api/util.js';

var debug          = true,
    detailsOverlay = {
      minWidth: 600,
      maxWidth: 1200
    };

export class AdventureContext {
  /**
   * Create a central reactive object to track adventure data and state
   */
  constructor (instance) {
    this.instance = instance;
    
    // Create the set of reactive vars
    this.adventure         = new ReactiveVar();
    this.controlledElement = new ReactiveVar();
    this.clickSpot         = new ReactiveVar();
    this.currentNodeId     = new ReactiveVar();
    this.currentNode       = new ReactiveVar();
    this.highlightElements = new ReactiveVar([]);
    this.processedElements = new ReactiveVar([]);
    this.screenMask        = new ReactiveVar();
    this.state             = new ReactiveVar();
    this.testSystem        = new ReactiveVar();
    this.viewport          = new ReactiveVar();
    this.lastClickLocation = new ReactiveVar();
  }
  
  /**
   * Subscribe to all of the data needed for the adventure console
   */
  setupSubscriptions () {
    let context  = this,
        instance = context.instance;
    instance.autorun(() => {
      let projectId        = FlowRouter.getParam("projectId"),
          projectVersionId = FlowRouter.getParam("projectVersionId"),
          adventureId      = FlowRouter.getParam("adventureId");
      
      instance.subscribe("adventure", adventureId);
      instance.subscribe("adventure_state", projectId, adventureId);
      instance.subscribe("adventure_actions", projectId, adventureId);
      instance.subscribe("adventure_commands", projectId, adventureId);
      instance.subscribe("nodes", projectId, projectVersionId);
      instance.subscribe("all_node_checks", projectId, projectVersionId);
      instance.subscribe("actions", projectId, projectVersionId);
      instance.subscribe("test_servers", projectId, projectVersionId);
      instance.subscribe("test_systems", projectId, projectVersionId);
      instance.subscribe("test_agents", projectId, projectVersionId);
    });
    
    return this;
  }
  
  /**
   * Load the records needed for this adventure
   */
  loadData () {
    let context  = this,
        instance = this.instance;
    
    // Load the adventure record
    instance.autorun(() => {
      debug && console.log("AdventureContext adventure autorun");
      let adventureId = FlowRouter.getParam("adventureId");
      
      if (instance.subscriptionsReady()) {
        debug && console.log("AdventureContext subscriptions ready");
        let adventure = Adventures.findOne(adventureId);
        context.adventure.set(adventure);
      }
    });
    
    // Load the adventure state record
    instance.autorun(() => {
      debug && console.log("AdventureContext adventure state autorun");
      let adventureId = FlowRouter.getParam("adventureId");
      
      if (instance.subscriptionsReady()) {
        context.state.set(AdventureStates.findOne({ adventureId: adventureId }));
      }
    });
    
    // Load the other supporting data that is less likely to react
    instance.autorun(() => {
      debug && console.log("AdventureContext stable data autorun");
      // Test System
      let adventure = context.adventure.get();
      if (adventure && adventure.testSystemId) {
        context.testSystem.set(TestSystems.findOne({
          staticId: adventure.testSystemId, projectVersionId: adventure.projectVersionId
        }));
      }
    });
    
    // Create a debounced version of the check function
    var lazyLocationCheck = _.debounce(context.checkLocation, 250);
    
    // Monitor the adventure location
    instance.autorun(() => {
      debug && console.log("AdventureContext location monitoring autorun");
      let adventureId = FlowRouter.getParam("adventureId");
      if (instance.subscriptionsReady()) {
        // pick up any updates to the last known node
        Adventures.find({ _id: adventureId }).observeChanges({
          changed (id, fields) {
            //console.log("Adventure changed: ", fields);
            if (_.contains(_.keys(fields), "lastKnownNode")) {
              debug && console.log("AdventureContext: checking current location against updated lastKnownNode ", fields.lastKnownNode);
              lazyLocationCheck.call(context)
            }
          }
        });
        
        // React to changes in the url
        AdventureStates.find({ adventureId: adventureId }).observeChanges({
          changed (id, fields) {
            //console.log("Adventure State changed: ", _.keys(fields));
            if (_.contains(_.keys(fields), "url") || _.contains(_.keys(fields), "title")) {
              debug && console.log("AdventureContext: checking current location", fields);
              lazyLocationCheck.call(context)
            }
          }
        });
      }
    });
    
    // Respond to the adventure current node changing
    instance.autorun(() => {
      debug && console.log("AdventureContext.currentNodeId autorun");
      let currentNodeId = context.currentNodeId.get();
      debug && console.log("AdventureContext.currentNodeId autorun currentNodeId:", currentNodeId);
      if (context.previousLocation && currentNodeId && context.previousLocation !== currentNodeId) {
        debug && console.log("Current node changed, clearing highlights:", currentNodeId, instance.previousLocation);
        instance.$(".btn-clear-highlight").trigger("click");
      }
      context.previousLocation = currentNodeId;
    });
    
    // Keep a live record of the current node
    instance.autorun(() => {
      debug && console.log("AdventureContext.currentNode autorun");
      let currentNodeId    = context.currentNodeId.get(),
          projectVersionId = FlowRouter.getParam("projectVersionId"),
          node             = Nodes.findOne({
            $or             : [ { staticId: currentNodeId }, { _id: currentNodeId } ],
            projectVersionId: projectVersionId
          });
      if(node){
        debug && console.log("AdventureContext.currentNode autorun setting node:", node);
      } else if(currentNodeId && currentNodeId.length) {
        console.error('AdventureContext.currentNode autorun failed to find node by id:', currentNodeId);
      } else {
        debug && console.log("AdventureContext.currentNode autorun had no node id");
      }
      context.currentNode.set(node);
    });
    
    // Monitor screen resizing
    instance.autorun(() => {
      debug && console.log("AdventureContext.resize autorun");
      var resize = Session.get("resize");
      context.updateViewport();
    });
    
    // Keep a list of processed highlight elements
    instance.autorun(() => {
      debug && console.log("AdventureContext.processedElements autorun");
      let context           = this,
          state             = context.state.get(),
          localViewport     = context.screenMask.get(),
          processedElements = [];
      
      if (localViewport && state && state.viewportSize) {
        let remoteViewport    = state.viewportSize,
            remoteScroll      = state.scroll,
            highlightElements = context.highlightElements.get(),
            aspectRatio       = localViewport.width / remoteViewport.width,
            windowSize        = Session.get("resize");
        
        highlightElements.forEach((element, i) => {
          element.index       = i;
          element.context     = context;
          element.localBounds = {
            top   : parseInt((element.bounds.top - remoteScroll.y + element.bounds.scrollY) * aspectRatio),
            left  : parseInt((element.bounds.left - remoteScroll.x + element.bounds.scrollX) * aspectRatio),
            height: parseInt(element.bounds.height * aspectRatio),
            width : parseInt(element.bounds.width * aspectRatio)
          };
          
          // Place the details overlay based on the position and width
          if ((localViewport.left + element.localBounds.left + detailsOverlay.maxWidth) > localViewport.width) {
            element.detailBounds = {
              top     : localViewport.top + element.localBounds.top + element.localBounds.height + 5,
              right   : windowSize.width - (localViewport.left + localViewport.width),
              maxWidth: Math.min(localViewport.width, detailsOverlay.maxWidth)
            };
          } else {
            element.detailBounds = {
              top     : localViewport.top + element.localBounds.top + element.localBounds.height + 5,
              left    : localViewport.left + element.localBounds.left,
              maxWidth: Math.min(localViewport.width, windowSize.width - localViewport.left, detailsOverlay.maxWidth)
            };
          }
          
          // get the hierarchy
          if (element.parent) {
            element.hierarchyElements = Util.getHighlightHierarchy(element);
            element.hierarchyElements.push(_.omit(element, "parent"));
            element.hierarchyElements.forEach((hierarchyElement, i) => {
              hierarchyElement.index       = i;
              hierarchyElement.localBounds = {
                top   : parseInt((hierarchyElement.bounds.top - remoteScroll.y + hierarchyElement.bounds.scrollY) * aspectRatio),
                left  : parseInt((hierarchyElement.bounds.left - remoteScroll.x + hierarchyElement.bounds.scrollX) * aspectRatio),
                height: parseInt(hierarchyElement.bounds.height * aspectRatio),
                width : parseInt(hierarchyElement.bounds.width * aspectRatio)
              };
              hierarchyElement.context     = context;
            });
          }
          
          debug && console.log("AdventureContext.processedHighlightElements[", i, "]:", element);
          processedElements.push(element);
        });
      }
      
      context.processedElements.set(processedElements)
    });
    
    return this;
  }
  
  /**
   * Get the node finder for the correct platform type
   */
  comparitor () {
    return this.adventure.get().platformType().comparitor;
  }
  
  /**
   * Update the dimensions of the viewport and screen mask
   */
  updateViewport () {
    debug && console.log("AdventureContext.updateViewport");
    let context      = this,
        remoteScreen = $(".remote-screen");
    if (remoteScreen.length) {
      let parent      = remoteScreen.offsetParent(),
          borderWidth = parseInt(remoteScreen.css("border-width")),
          viewport    = {
            width       : remoteScreen.width(),
            height      : remoteScreen.height(),
            offset      : remoteScreen.offset(),
            parentOffset: parent.offset(),
            borderWidth : borderWidth
          };
      
      debug && console.log("AdventureContext.updateViewport remote screen dimensions:", remoteScreen.width(), remoteScreen.height());
      debug && console.log("AdventureContext.updateViewport borderWidth:", borderWidth);
      debug && console.log("AdventureContext.updateViewport viewport:", viewport);
      
      viewport.parentOffset.height = parent.height();
      viewport.parentOffset.width  = parent.width();
      
      // set the viewport
      context.viewport.set(viewport);
      
      // recalculate the screen mask
      context.screenMask.set({
        top   : viewport.offset.top - viewport.parentOffset.top + viewport.borderWidth,
        left  : viewport.offset.left - viewport.parentOffset.left + viewport.borderWidth,
        height: viewport.height,
        width : viewport.width
      });
    }
    
    return context;
  }
  
  /**
   * Check the current location
   */
  checkLocation () {
    debug && console.log("AdventureContext.checkLocation");
    var context     = this,
        adventure   = context.adventure.get(),
        state       = context.state.get(),
        comparitor  = adventure.platformType().comparitor,
        clearWinner = comparitor.searchByContext(state, adventure.projectVersionId).clearWinner();
    
    if (clearWinner) {
      console.log("AdventureContext.checkLocation location identified:", clearWinner.node);
      context.currentNodeId.set(clearWinner.node.staticId);
    }
  }
  
  /**
   * Create a highlight element placeholder at the point of a click
   * @param remoteX
   * @param remoteY
   * @param clickEvent
   */
  setClickSpot (remoteX, remoteY, clickEvent) {
    debug && console.log("setClickSpot:", remoteX, remoteY, clickEvent);
    let context = this;
    //context.clickSpot.set({ x: clickEvent.offsetX, y: clickEvent.offsetY });
    context.highlightElements.set([]);
    setTimeout(() => {
      context.highlightElements.set([ {
        placeholder: true,
        bounds     : {
          top    : remoteY - 25,
          left   : remoteX - 25,
          width  : 50,
          height : 50,
          scrollY: 0,
          scrollX: 0
        }
      } ]);
    }, 30);
    setTimeout(() => {
      //context.clickSpot.set();
    }, 1250);
  }
  
  /**
   * Show the hover controls connected to an element
   * @param element
   */
  showHoverControls (element) {
    debug && console.log("AdventureContext.showHoverControls");
    let context        = this,
        hoverContainer = $(".hover-controls-container");
    
    clearTimeout(context.hideHoverControlsTimeout);
    
    if (element.localBounds && hoverContainer) {
      hoverContainer
          .css("top", element.localBounds.top - 40)
          .css("left", element.localBounds.left)
          .css("display", "block");
      
      context.controlledElement.set(element);
    }
    
  }
  
  /**
   * Set a timeout to hide the hover controls
   */
  considerHidingHoverControls () {
    debug && console.log("AdventureContext.considerHidingHoverControls");
    let context = this;
    
    clearTimeout(context.hideHoverControlsTimeout);
    
    context.hideHoverControlsTimeout = setTimeout(() => {
      context.hideHoverControls();
    }, 500);
  }
  
  /**
   * Hide the hover controls
   */
  hideHoverControls () {
    debug && console.log("AdventureContext.hideHoverControls");
    let context = this;
    
    delete context.hideHoverControlsTimeout;
    $(".hover-controls-container").css("display", "");
    context.controlledElement.set();
  }
  
  /**
   * Show the current location section
   * @param toggle Toggle the section?
   */
  showCurrentLocation (toggle, callback) {
    debug && console.log("AdventureContext.showCurrentLocation:", toggle);
    let locationContainer = $('.current-location'),
        actionsContainer  = $('.current-location-actions'),
        actionsIsVisible  = actionsContainer.css("display") != "none",
        isHidden          = locationContainer.css("display") == "none";
    
    if (isHidden && actionsIsVisible) {
      actionsContainer.slideUp(250, () => {
        locationContainer.slideDown(250, callback);
      });
    } else if (isHidden) {
      locationContainer.slideDown(250, callback);
    } else if (toggle) {
      locationContainer.slideUp(250, callback);
    } else if (callback) {
      callback()
    }
  }
  
  /**
   * Show the current location actions section
   * @param toggle Toggle the section?
   */
  showCurrentLocationActions (toggle, callback) {
    debug && console.log("AdventureContext.showCurrentLocationActions:", toggle);
    let locationContainer = $('.current-location'),
        actionsContainer  = $('.current-location-actions'),
        locationIsVisible = locationContainer.css("display") != "none",
        isHidden          = actionsContainer.css("display") == "none";
    
    if (isHidden && locationIsVisible) {
      locationContainer.slideUp(250, () => {
        actionsContainer.slideDown(250, callback);
      });
    } else if (isHidden) {
      actionsContainer.slideDown(250, callback);
    } else if (toggle) {
      actionsContainer.slideUp(250, callback);
    } else if (callback) {
      callback()
    }
  }
  
  /**
   * Hide either current location or current location actions if either are visible
   */
  hideLocationPanel (callback) {
    debug && console.log("AdventureContext.hideLocationPanel");
    let locationContainer = $('.current-location'),
        actionsContainer  = $('.current-location-actions'),
        actionsIsVisible  = actionsContainer.css("display") != "none",
        locationIsVisible = locationContainer.css("display") != "none";
    
    if (locationIsVisible) {
      locationContainer.slideUp(250, callback);
    } else if (actionsIsVisible) {
      actionsContainer.slideDown(250, callback);
    } else if (callback) {
      callback()
    }
  }
}