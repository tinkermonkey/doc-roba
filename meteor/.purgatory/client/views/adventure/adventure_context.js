/**
 * Template Helpers
 */
Template.AdventureContext.helpers({
  getNode: function () {
    //console.log("AdventureContext: ", this);
    if(this.currentNodeId && this.currentNodeId.get()){
      var node = Collections.Nodes.findOne({staticId: this.currentNodeId.get(), projectVersionId: this.adventure.projectVersionId});
      //console.log("AdventureContext, node: ", node);
      if(node){
        // clear the ignore list once a node is found
        delete this.ignore;
      }
      return node;
    }
  },
  searchNodes: function () {
    if(this.state && this.state.url){
      // check the results for an exact match
      var instance = Template.instance(),
        results = NodeSearch.byUrl(this.state.url, this.state.title, this.adventure.projectVersionId),
        matchCount = 0, match;

      _.each(results, function (result) {
        if(result.url.match && result.params.match && result.title.match){
          matchCount++;
          match = result;
        }
        //console.log("searchNodes: ", result.node.title, result.url.match, result.params.match, result.title.match);
      });

      if(matchCount == 1 && match){
        // Check to make sure we don't find what was asked to be ignored
        if(instance.ignore && instance.ignore == match.node.staticId){
          console.debug("searchNodes found a single match but it was to be ignored: " + match.node.staticId);
          return results;
        }

        // One and only one match, just figure we know the location
        console.debug("searchNodes found a single match: " + match.node.staticId);
        this.currentNodeId.set(match.node.staticId);
      } else {
        console.debug("searchNodes result count: " + results.length);
        return results;
      }
    }
  },
  isMatch: function (node, data) {
    if(node && data){
      var result = NodeSearch.compareNode(data.state.url, data.state.title, node);
      return result.url.match && result.params.match && result.title.match;
    }
  },
  nodeComparison: function (node, data) {
    if(node && data) {
      var result = NodeSearch.compareNode(data.state.url, data.state.title, node);
      return result;
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureContext.events({
  "click .btn-add-node": function (e, instance) {
    // Show the form
    instance.$(".add-node-form").removeClass("hide");

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
        record = formInstance.nodeRecord.get();
      mapInstance.mapLayout.highlightNodes([record.parentId]);
    } catch (e) {
      console.error("Failed to locate map container: " + e.message);
    }
  },
  "click .btn-cancel-node": function (e, instance) {
    // Hide the form
    instance.$(".add-node-form").addClass("hide");

    // Show the buttons
    instance.$(".btn-add-node").removeClass("hide");

    // Show the search results
    //instance.$(".node-url-search").removeClass("hide");
    try {
      var mapInstance = Blaze.getView($(".map-tree-base").get(0)).templateInstance(),
        finalWidth = mapInstance.$(".map-tree-base").closest(".row").width() / 3,
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
  "click .btn-wrong-node": function (e, instance) {
    try {
      // set the state so that we don't just re-run the search
      instance.ignore = instance.data.currentNodeId.get();

      // clear the current node identification
      instance.data.currentNodeId.set();
    } catch(e) {
      console.error("Failed to clear node context: " + e.message);
      Dialog.error("Failed to clear node context: " + e.message);
    }
  },
  "click .btn-create-node": function (e, instance) {
    try {
      var record = Blaze.getView($(".btn-create-node").get(0)).templateInstance().nodeRecord.get();
      if(!record.parentId){
        Dialog.error("Please select a parent node for this node");
        return;
      } else if (!record.title) {
        Dialog.error("Please enter a name for this node");
        return;
      }

      // Get the parent node to figure out the platform and user type
      var parent = Collections.Nodes.findOne({staticId: record.parentId, projectVersionId: record.projectVersionId});
      if(!parent){
        console.error("Create node failed: could not find parent node " + record.parentId + " for project " + record.projectVersionId);
        Dialog.error("Create node failed: could not find parent node " + record.parentId + " for project " + record.projectVersionId);
        return;
      }
      record.userTypeId = parent.userTypeId;
      record.platformId = parent.platformId;

      // create the record
      Collections.Nodes.insert(record);
    } catch (e) {
      console.error("Failed to load new record: " + e.message);
    }
  },
  "edited .node-edit-form .editable": function (e, instance, newValue) {
    e.stopImmediatePropagation();
    var nodeId = $(e.target).closest(".node-edit-form").attr("data-node-id"),
      target = $(e.target),
      dataKey = target.attr("data-key"),
      update = {$set: {}};

    console.log("NodeEditForm update: ", dataKey, nodeId);
    if(dataKey){
      update["$set"][dataKey] = newValue;
      //console.log("Edited: ", dataKey, newValue, node);
      Collections.Nodes.update(nodeId, update, function (error) {
        if(error){
          console.error("Failed to update node value: " + error.message);
          Dialog.error("Failed to update node value: " + error.message);
        }
      });
    } else {
      console.error("Failed to update node value: data-key not found");
      Dialog.error("Failed to update node value: data-key not found");
    }
  },
  "edited .current-node-selector": function (e, instance, newValue) {
    e.stopImmediatePropagation();
    if(newValue){
      console.log("Node Selected: ", newValue);
      instance.data.currentNodeId.set(newValue)
    }
  },
  "click .btn-preview": function (e, instance) {
    var field = $(e.target).closest(".btn").attr("data-field"),
      node = this,
      adventureContext = Template.parentData(1);
    console.log("Preview: ", field);

    // send the command to get information about the "clicked" element
    if(field && node[field] && _.contains([AdventureStatus.awaitingCommand], adventureContext.adventure.status)){
      Collections.AdventureCommands.insert({
        projectId: adventureContext.adventure.projectId,
        adventureId: adventureContext.adventure._id,
        updateState: false,
        code: "driver.previewCode(\"" + btoa(node[field]) + "\");"
      }, function (error) {
        if(error){
          console.error("Error adding adventure command: " + error.message);
          Dialog.error("Error adding adventure command: " + error.message);
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.AdventureContext.created = function () {
};

/**
 * Template Rendered
 */
Template.AdventureContext.rendered = function () {
  var instance = Template.instance();

  // Enable the popover hint for the wrong-node button
  instance.$(".btn-wrong-node").popover({
    placement: 'left',
    trigger: 'hover',
    html: true,
    delay: 500
  });

};

/**
 * Template Destroyed
 */
Template.AdventureContext.destroyed = function () {

};
