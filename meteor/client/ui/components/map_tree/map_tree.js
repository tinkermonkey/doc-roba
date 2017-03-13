import './map_tree.html';
import { Template } from 'meteor/templating';
import { Actions } from '../../../../imports/api/actions/actions.js';
import { Nodes } from '../../../../imports/api/nodes/nodes.js';
import { MapLayout } from './map_layout.js';

/**
 * Template Helpers
 */
Template.MapTree.helpers({});

/**
 * Template Event Handlers
 */
Template.MapTree.events({});

/**
 * Template Created
 */
Template.MapTree.created = function () {
  let instance  = Template.instance();
  instance.size = new ReactiveVar();
};

/**
 * Template Rendered
 */
Template.MapTree.rendered = function () {
  let instance = Template.instance();
  
  if (!instance.init) {
    instance.init = true;
    
    // Setup the view only once
    instance.mapLayout = new MapLayout(instance.elementId, instance.data);
    
    // Short circuit the buffering mechanism
    instance.lastUpdate = 1;
    
    // for the data binding we just need to setup an update call
    instance.autorun(function () {
      // get the nodes and actions
      var projectVersionId = instance.data.adventure.get().projectVersionId,
          mapNodes         = Nodes.find({ projectVersionId: projectVersionId }).fetch(),
          mapActions       = Actions.find({ projectVersionId: projectVersionId }).fetch();
      
      if (instance.lastUpdate && Date.now() - instance.lastUpdate > 1000) {
        console.log("MapTree autorun: direct update");
        // update the nodes & actions
        instance.mapLayout.nodeHandler.setNodes(mapNodes);
        instance.mapLayout.actionHandler.setActions(mapActions);
        
        // set up the base
        instance.lastUpdate = Date.now();
        instance.mapLayout.update();
      } else {
        // buffer these updates
        if (instance.updateTimeout) {
          clearTimeout(instance.updateTimeout);
        }
        
        instance.updateTimeout = setTimeout(function () {
          console.log("MapTree autorun: buffered update, ", mapNodes.length, mapActions.length);
          delete instance.updateTimeout;
          
          // get fresh node data
          instance.mapLayout.nodeHandler.setNodes(mapNodes);
          instance.mapLayout.actionHandler.setActions(mapActions);
          
          // set up the base
          instance.lastUpdate = Date.now();
          instance.mapLayout.update();
        }, 1000);
      }
    });
    
    // respond to window resize events
    instance.autorun(function () {
      var resize = Session.get("resize");
      instance.mapLayout.resize();
      instance.size.set({
        width : instance.mapLayout.width,
        height: instance.mapLayout.height
      });
    });
    
    // respond to asking for a node to be centered
    instance.autorun(function () {
      console.log("MapTree autorun: responding to current node change");
      var nodeId = instance.data.currentNodeId.get();
      if (nodeId) {
        instance.mapLayout.centerNode(nodeId, 0.66);
        instance.mapLayout.showNodeActions(nodeId);
      } else {
        instance.mapLayout.zoomAll();
        instance.mapLayout.actionHandler.clearVisibleActions();
        instance.mapLayout.showLocationUnknown();
        instance.mapLayout.clearCenteredNode();
      }
    });
    
    // Initialize the tree after setting up autorun so there is data to initialize
    instance.mapLayout.init();
    
    // zoom all if there is nothing to zoom to
    if (!instance.data.currentNodeId.get()) {
      instance.mapLayout.zoomAll();
      instance.mapLayout.showLocationUnknown();
    }
  }
};

/**
 * Template Destroyed
 */
Template.MapTree.destroyed = function () {
  this.mapLayout.destroy();
};
