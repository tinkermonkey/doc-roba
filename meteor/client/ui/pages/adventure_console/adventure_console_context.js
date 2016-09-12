import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Adventures } from '../../../../imports/api/adventure/adventure.js';
import { AdventureStates } from '../../../../imports/api/adventure/adventure_state.js';
import { TestSystems } from '../../../../imports/api/test_system/test_system.js';
import { NodeSearch } from '../../../../imports/api/node_search/node_search.js';

export class AdventureConsoleContext {
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
    this.highlightElements = new ReactiveVar([]);
    this.previewElements   = new ReactiveVar([]);
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
      console.log("AdventureConsoleContext adventure autorun");
      let adventureId = FlowRouter.getParam("adventureId");
      
      if (instance.subscriptionsReady()) {
        let adventure = Adventures.findOne(adventureId);
        context.adventure.set(adventure);
      }
    });
    
    // Load the adventure state record
    instance.autorun(() => {
      console.log("AdventureConsoleContext adventure state autorun");
      let adventureId = FlowRouter.getParam("adventureId");
      
      if (instance.subscriptionsReady()) {
        context.state.set(AdventureStates.findOne({ adventureId: adventureId }));
      }
    });
    
    // Load the other supporting data that is less likely to react
    instance.autorun(() => {
      console.log("AdventureConsoleContext stable data autorun");
      // Test System
      let adventure = context.adventure.get();
      if(adventure && adventure.testSystemId){
        context.testSystem.set(TestSystems.findOne({
          staticId: adventure.testSystemId, projectVersionId: adventure.projectVersionId
        }));
      }
    });
    
    // Monitor the adventure location
    instance.autorun(() => {
      console.log("AdventureConsoleContext location monitoring autorun");
      let adventureId = FlowRouter.getParam("adventureId");
      if (instance.subscriptionsReady()) {
        // pick up any updates to the last known node
        Adventures.find({ _id: adventureId }).observeChanges({
          changed (id, fields) {
            //console.log("Adventure changed: ", fields);
            if (_.contains(_.keys(fields), "lastKnownNode")) {
              //console.log("AdventureConsole: checking current location against updated lastKnownNode ", fields.lastKnownNode);
              setTimeout(function () {
                NodeSearch.checkAdventureLocation(context);
              }, 100);
            }
          }
        });
  
        // React to changes in the url
        AdventureStates.find({ adventureId: adventureId }).observeChanges({
          changed (id, fields) {
            //console.log("Adventure State changed: ", _.keys(fields));
            if (_.contains(_.keys(fields), "url") || _.contains(_.keys(fields), "title")) {
              //console.log("AdventureConsole: checking current location", fields);
              setTimeout(function () {
                NodeSearch.checkAdventureLocation(context);
              }, 100);
            }
          }
        });
      }
    });
    
    // Respond to the adventure current node changing
    instance.autorun(() => {
      console.log("AdventureConsoleContext currentNodeId monitoring autorun");
      let currentLocation = context.currentNodeId.get();
      console.log("currentLocation:", currentLocation);
      if (context.previousLocation && currentLocation && context.previousLocation !== currentLocation) {
        console.log("Current node changed, clearing highlights:", currentLocation, instance.previousLocation);
        instance.$(".btn-clear-highlight").trigger("click");
      }
      context.previousLocation = currentLocation;
    });
    
    // Monitor screen resizing
    instance.autorun(() => {
      var resize = Session.get("resize");
      context.updateViewport();
    });
    
    return this;
  }
  
  /**
   * Update the dimensions of the viewport
   */
  updateViewport () {
    let context = this,
        remoteScreen = $(".remote-screen");
    if (remoteScreen.length) {
      let parent   = remoteScreen.offsetParent(),
          viewport = {
            width       : remoteScreen.width(),
            height      : remoteScreen.height(),
            offset      : remoteScreen.offset(),
            parentOffset: parent.offset()
          };
      
      viewport.parentOffset.height = parent.height();
      viewport.parentOffset.width  = parent.width();
      
      if(context.viewport){
        context.viewport.set(viewport);
      } else {
        console.error("viewport not set: ", context);
      }
    }
    
    return context;
  }
}