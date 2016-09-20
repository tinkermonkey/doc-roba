import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Adventures } from '../../../../imports/api/adventure/adventure.js';
import { AdventureStates } from '../../../../imports/api/adventure/adventure_state.js';
import { TestSystems } from '../../../../imports/api/test_system/test_system.js';
import { Util } from '../../../../imports/api/util.js';

var debug = false;

export class AdventureContext {
  /**
   * Create a central reactive object to track adventure data and state
   */
  constructor (instance) {
    this.instance = instance;
    
    // Create the set of reactive vars
    this.currentNodeId     = new ReactiveVar();
    this.adventure         = new ReactiveVar();
    this.state             = new ReactiveVar();
    this.testSystem        = new ReactiveVar();
    this.viewport          = new ReactiveVar();
    this.screenMask        = new ReactiveVar();
    this.highlightElements = new ReactiveVar([]);
    this.processedElements = new ReactiveVar([]);
    this.selectorElements  = new ReactiveVar({});
    this.controlledElement = new ReactiveVar();
    this.checkResult       = new ReactiveVar();
    this.lastClickLocation = new ReactiveVar();
  }
  
  /**
   * Subscribe to all of the data needed for the adventure console
   */
  setupSubscriptions () {
    let instance = this.instance;
    instance.autorun(() => {
      var projectId        = FlowRouter.getParam("projectId"),
          projectVersionId = FlowRouter.getParam("projectVersionId"),
          adventureId      = FlowRouter.getParam("adventureId");
      
      instance.subscribe("adventure", adventureId);
      instance.subscribe("adventure_state", adventureId);
      instance.subscribe("adventure_actions", adventureId);
      instance.subscribe("adventure_commands", adventureId);
      instance.subscribe("nodes", projectId, projectVersionId);
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
      let currentLocation = context.currentNodeId.get();
      debug && console.log("currentLocation:", currentLocation);
      if (context.previousLocation && currentLocation && context.previousLocation !== currentLocation) {
        debug && console.log("Current node changed, clearing highlights:", currentLocation, instance.previousLocation);
        instance.$(".btn-clear-highlight").trigger("click");
      }
      context.previousLocation = currentLocation;
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
            aspectRatio       = localViewport.width / remoteViewport.width;
        
        highlightElements.forEach((element, i) => {
          element.index        = i;
          element.context      = context;
          element.localBounds  = {
            top   : parseInt((element.bounds.top - remoteScroll.y + element.bounds.scrollY) * aspectRatio),
            left  : parseInt((element.bounds.left - remoteScroll.x + element.bounds.scrollX) * aspectRatio),
            height: parseInt(element.bounds.height * aspectRatio),
            width : parseInt(element.bounds.width * aspectRatio)
          };
          element.detailBounds = {
            top     : localViewport.top + element.localBounds.top + element.localBounds.height + 5,
            left    : localViewport.left + element.localBounds.left > localViewport.width * 0.5 ? localViewport.width * 0.5 : element.localBounds.left,
            maxWidth: localViewport.width
          };
          
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
    return this.adventure.get().platformType().nodeComparitor();
  }
  
  /**
   * Update the dimensions of the viewport and screen mask
   */
  updateViewport () {
    let context      = this,
        remoteScreen = $(".remote-screen");
    if (remoteScreen.length) {
      let parent      = remoteScreen.offsetParent(),
          borderWidth = parseInt(remoteScreen.css("border-width")),
          viewport    = {
            width       : remoteScreen.width() - borderWidth,
            height      : remoteScreen.height() - borderWidth,
            offset      : remoteScreen.offset(),
            parentOffset: parent.offset(),
            borderWidth : borderWidth
          };
      
      viewport.parentOffset.height = parent.height();
      viewport.parentOffset.width  = parent.width();
      
      // set the viewport
      context.viewport.set(viewport);
      
      // recalculate the screen mask
      context.screenMask.set({
        top   : viewport.offset.top - viewport.parentOffset.top + viewport.borderWidth,
        left  : viewport.offset.left - viewport.parentOffset.left + viewport.borderWidth,
        height: viewport.height - 2 * viewport.borderWidth,
        width : viewport.width - 2 * viewport.borderWidth
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
        comparitor  = adventure.platformType().nodeComparitor(),
        clearWinner = comparitor.searchByContext(state, adventure.projectVersionId).clearWinner();
    
    if (clearWinner) {
      console.log("AdventureContext.checkLocation location identified:", clearWinner.node);
      context.currentNodeId.set(clearWinner.node.staticId);
    }
  }
}