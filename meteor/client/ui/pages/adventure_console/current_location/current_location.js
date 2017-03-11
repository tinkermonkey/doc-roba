import './current_location.html';
import './current_location.css';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureStatus } from '../../../../../imports/api/adventures/adventure_status.js';
import { Nodes } from '../../../../../imports/api/nodes/nodes.js';
import { NodeCheckTypes } from '../../../../../imports/api/nodes/node_check_types.js';
import '../../../components/editable_fields/editable_node_type.js';
import '../../../components/editable_fields/editable_code/editable_code.js';
import '../../../components/editable_fields/node_selector/editable_node_selector.js';
import './create_node_form.js';
import '../../../components/node_search/node_url_search_results.js';

/**
 * Template Helpers
 */
Template.CurrentLocation.helpers({
  /**
   * Get the current node
   * @return {*}
   */
  currentNode () {
    //console.log("CurrentLocation: ", this);
    let currentNode = this.currentNode.get();
    
    if (currentNode) {
      // clear the ignore list once a node is found
      delete Template.instance().ignore;
      return currentNode;
    }
  },
  
  /**
   * Search for nodes which match the current location
   * @return {*}
   */
  searchNodes () {
    let state     = this.state.get(),
        adventure = this.adventure.get();
    
    if (state && state.url) {
      // check the results for an exact match
      var instance = Template.instance(),
          results  = instance.comparitor.searchByContext(state, adventure.projectVersionId),
          winner   = results.clearWinner();
      
      // see if there's a clear winner
      if (winner) {
        if (instance.ignore && instance.ignore == winner.node.staticId) {
          console.debug("searchNodes found a single match but it was to be ignored: " + winner.node.staticId);
          return results;
        }
        
        console.debug("searchNodes found a single match: " + winner.node.staticId);
        this.currentNodeId.set(winner.node.staticId);
      } else {
        return results;
      }
    }
  },
  
  /**
   * Compare the current context to the selected node
   * @param node
   * @param context
   * @return {*}
   */
  nodeComparison (node, context) {
    if (node && context) {
      let state    = context.state.get(),
          instance = Template.instance();
      return instance.comparitor.compareNode(state, node);
    }
  },
  
  /**
   * Get the correct Comparison panel template for the current platformType
   * @return {*}
   */
  searchComparisonPanel(){
    let node         = Template.parentData(1),
        platformType = node.platformType();
    if (platformType) {
      return platformType.templates.nodeSearchComparison;
    }
  },
  
  /**
   * Get the correct Edit Params template for the current platformType
   * @return {*}
   */
  editParamsPanel(){
    let platformType = this.platformType();
    if (platformType) {
      return platformType.templates.nodeEditDetails;
    }
  },
  
  /**
   * Node Check Types
   */
  nodeChecks(){
    return NodeCheckTypes;
  }
});

/**
 * Template Event Handlers
 */
Template.CurrentLocation.events({
  /**
   * Show the create node form
   * @param e
   * @param instance
   */
  "click .btn-add-node" (e, instance) {
    console.log('CurrentLocation click btn-add-node');
    
    // Show the form
    instance.$(".create-node-form").removeClass("hide");
    
    // Hide the buttons
    instance.$(".btn-add-node").addClass("hide");
    
    // Hide the search results
    //instance.$(".node-url-search").addClass("hide");
    
    // update the map view
    try {
      var mapInstance = Blaze.getView($(".map-tree-base").get(0)).templateInstance();
      setTimeout(function () {
        mapInstance.mapLayout.zoomAll(250);
      }, 250);
      
      var formInstance = Blaze.getView($(".btn-select-parent").get(0)).templateInstance(),
          record       = formInstance.nodeRecord.get();
      mapInstance.mapLayout.highlightNodes([ record.parentId ]);
    } catch (e) {
      console.error("Failed to locate map container: " + e.message);
    }
  },
  
  /**
   * Clear the current nodeId and block this one from matching again
   * @param e
   * @param instance
   */
  "click .btn-wrong-node" (e, instance) {
    try {
      // set the state so that we don't just re-run the search
      instance.ignore = instance.data.currentNodeId.get();
      
      // clear the current node identification
      instance.data.currentNodeId.set();
    } catch (e) {
      RobaDialog.error("Failed to clear node context: " + e.message);
    }
  },
  
  /**
   * Capture a forced change of node context
   * @param e
   * @param instance
   * @param newValue
   */
  "edited .current-node-selector" (e, instance, newValue) {
    e.stopImmediatePropagation();
    if (newValue) {
      console.log("CurrentLocation node Selected: ", newValue);
      
      // Update the current node value
      instance.data.currentNodeId.set(newValue);
      
      // Show the current node form
      setTimeout(() => {
        instance.data.showCurrentLocation();
      }, 250);
    }
  },
  
  /**
   * Capture edited events for the current actions
   * @param e
   * @param instance
   * @param newValue
   */
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    var target  = $(e.target),
        nodeId  = target.closest(".current-location").attr("data-node-id"),
        dataKey = target.attr("data-key"),
        update  = { $set: {} },
        node;
    
    if (dataKey && nodeId) {
      node = Nodes.findOne(nodeId);
      if(node){
        console.log("CurrentLocation node update: ", dataKey, newValue, nodeId, node._id);
        update[ "$set" ][ dataKey ] = newValue;
        Nodes.update(node._id, update, function (error, response) {
          if (error) {
            RobaDialog.error("Failed to update node value: " + error.message);
          }
        });
      } else {
        RobaDialog.error("Failed to update node value: node not found with _id " + nodeId);
      }
    } else {
      RobaDialog.error("Failed to update node value: data-key not found");
    }
  },
  
  /**
   * Preview the node checks (highlight the elements and show an icon explaining what they do)
   * @param e
   * @param instance
   */
  "click .btn-preview" (e, instance) {
    var adventure        = instance.data.adventure.get(),
        field            = $(e.target).closest(".btn").attr("data-field"),
        node             = this,
        adventureContext = Template.parentData(1);
    console.log("Preview: ", field);
    
    // send the command to get information about the "clicked" element
    if (field && node[ field ] && _.contains([ AdventureStatus.awaitingCommand ], adventureContext.adventure.status)) {
      let code = "driver.previewCode(\"" + btoa(node[ field ]) + "\");";
      adventure.assistant.executeCommand(adventure, code, (error, command) => {
        if (error) {
          RobaDialog.error("Error adding adventure command: " + error.message);
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.CurrentLocation.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let adventure       = instance.data.adventure.get();
    instance.comparitor = adventure.platformType().comparitor;
  });
});

/**
 * Template Rendered
 */
Template.CurrentLocation.onRendered(() => {
  let instance = Template.instance();
  
  // Enable the popover hint for the wrong-node button
  instance.$(".btn-wrong-node").popover({
    placement: 'left',
    trigger  : 'hover',
    html     : true,
    delay    : 500
  });
  
});

/**
 * Template Destroyed
 */
Template.CurrentLocation.onDestroyed(() => {
  
});
