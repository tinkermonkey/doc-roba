import './map_tree.html';
import './map_layout.css';

import {Template} from 'meteor/templating';

import {Actions} from '../../../api/action/action.js';
import {Nodes} from '../../../api/node/node.js';

import MapLayout from './map_layout.js';

/**
 * MapTree
 *
 * Created by austinsand on 3/28/15
 *
 */

/**
 * Template Helpers
 */
Template.MapTree.helpers({

});

/**
 * Template Event Handlers
 */
Template.MapTree.events({});

/**
 * Template Created
 */
Template.MapTree.created = function () {
  var instance = this;
  instance.size = new ReactiveVar();
};

/**
 * Template Rendered
 */
Template.MapTree.rendered = function () {
  var instance = this;

  if(!instance.init){
    instance.init = true;

    // Setup the view only once
    instance.mapLayout = new MapLayout(instance.elementId, instance.data);

    // Short circuit the buffering mechanism
    instance.lastUpdate = 1;

    // for the data binding we just need to setup an update call
    instance.autorun(function () {
      console.debug("Auto-run executing map_tree: ");

      // get the nodes and actions
      var mapNodes = Nodes.find({projectVersionId: instance.data.projectVersionId}).fetch(),
        mapActions = Actions.find({projectVersionId: instance.data.projectVersionId}).fetch();

      if(instance.lastUpdate && Date.now() - instance.lastUpdate > 1000){
        console.log("MapLayout: direct update");
        // update the nodes & actions
        instance.mapLayout.nodeHandler.setNodes(mapNodes);
        instance.mapLayout.actionHandler.setActions(mapActions);

        // set up the base
        instance.lastUpdate = Date.now();
        instance.mapLayout.update();
      } else {
        // buffer these updates
        if(instance.updateTimeout){
          clearTimeout(instance.updateTimeout);
        }

        instance.updateTimeout = setTimeout(function () {
          console.log("MapLayout: buffered update, ", mapNodes.length, mapActions.length);
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
        width: instance.mapLayout.width,
        height: instance.mapLayout.height
      });
    });

    // respond to asking for a node to be centered
    instance.autorun(function () {
      console.log("responding to current node change");
      var data = Template.currentData(),
        node = data.currentNodeId;
      if(node){
        instance.mapLayout.centerNode(node, 0.66);
        instance.mapLayout.showNodeActions(node);
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
    if(!instance.data.currentNodeId){
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
