import './current_location.html';
import './current_location.css';
import { Blaze } from 'meteor/blaze';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AdventureStatus } from '../../../../../imports/api/adventure/adventure_status.js';
import { Nodes } from '../../../../../imports/api/node/node.js';
import '../../../components/editable_fields/editable_node_type.js';
import '../../../components/editable_fields/editable_code/editable_code.js';
import '../../../components/editable_fields/node_selector/editable_node_selector.js';
import './create_node_form.js';
import '../../../components/node_search/node_url_search_results.js';

/**
 * Template Helpers
 */
Template.CurrentLocation.helpers({
  currentNode () {
    //console.log("CurrentLocation: ", this);
    let currentNodeId = this.currentNodeId.get(),
        adventure     = this.adventure.get();
    
    if (currentNodeId && adventure) {
      let node = Nodes.findOne({
        staticId        : currentNodeId,
        projectVersionId: adventure.projectVersionId
      });
      //console.log("CurrentLocation, node: ", node);
      if (node) {
        // clear the ignore list once a node is found
        delete Template.instance().ignore;
      }
      return node;
    }
  },
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
  nodeComparison (node, context) {
    if (node && context) {
      let state    = context.state.get(),
          instance = Template.instance();
      return instance.comparitor.compareNode(state, node);
    }
  },
  searchComparisonPanel(){
    let node         = Template.parentData(1),
        platformType = node.platformType();
    if (platformType) {
      return platformType.nodeSearchComparisonTemplate();
    }
  },
  editParamsPanel(){
    let platformType = this.platformType();
    if (platformType) {
      return platformType.nodeEditParamsTemplate();
    }
  }
});

/**
 * Template Event Handlers
 */
Template.CurrentLocation.events({
  "click .btn-create-node" (e, instance) {
    // Show the form
    instance.$(".create-node-form").removeClass("hide");
    
    // Hide the buttons
    instance.$(".btn-create-node").addClass("hide");
    
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
  "click .btn-cancel-node" (e, instance) {
    // Hide the form
    instance.$(".create-node-form").addClass("hide");
    
    // Show the buttons
    instance.$(".btn-create-node").removeClass("hide");
    
    // Show the search results
    //instance.$(".node-url-search").removeClass("hide");
    try {
      var mapInstance = Blaze.getView($(".map-tree-base").get(0)).templateInstance(),
          finalWidth  = mapInstance.$(".map-tree-base").closest(".row").width() / 3,
          finalHeight = mapInstance.$(".map-tree-base").height();
      //mapInstance.mapLayout.transitionZoomAll(finalWidth, finalHeight, 250);
      mapInstance.mapLayout.clearHighlight();
      setTimeout(function () {
        mapInstance.mapLayout.zoomAll(250);
      }, 250);
    } catch (e) {
      console.error("Failed to locate map container: " + e.message);
    }
  },
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
  "click .btn-create-node" (e, instance) {
    try {
      var record = Blaze.getView($(".btn-create-node").get(0)).templateInstance().nodeRecord.get();
      if (!record.parentId) {
        RobaDialog.error("Please select a parent node for this node");
        return;
      } else if (!record.title) {
        RobaDialog.error("Please enter a name for this node");
        return;
      }
      
      // Get the parent node to figure out the platform and user type
      var parent = Nodes.findOne({ staticId: record.parentId, projectVersionId: record.projectVersionId });
      if (!parent) {
        RobaDialog.error("Create node failed: could not find parent node " + record.parentId + " for project " + record.projectVersionId);
        return;
      }
      record.userTypeId = parent.userTypeId;
      record.platformId = parent.platformId;
      
      // create the record
      Nodes.insert(record);
    } catch (e) {
      console.error("Failed to load new record: " + e.message);
    }
  },
  "edited .node-edit-form .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    var nodeId  = $(e.target).closest(".current-location").attr("data-node-id"),
        target  = $(e.target),
        dataKey = target.attr("data-key"),
        update  = { $set: {} };
    
    console.log("NodeEditForm update: ", dataKey, nodeId);
    if (dataKey) {
      update[ "$set" ][ dataKey ] = newValue;
      //console.log("Edited: ", dataKey, newValue, node);
      Nodes.update(nodeId, update, function (error) {
        if (error) {
          console.error("Failed to update node value: " + error.message);
          RobaDialog.error("Failed to update node value: " + error.message);
        }
      });
    } else {
      RobaDialog.error("Failed to update node value: data-key not found");
    }
  },
  "edited .current-node-selector" (e, instance, newValue) {
    e.stopImmediatePropagation();
    if (newValue) {
      console.log("Node Selected: ", newValue);
      instance.data.currentNodeId.set(newValue)
    }
  },
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
    instance.comparitor = adventure.platformType().nodeComparitor();
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
