/**
 * Constructor for custom d3 tree layout
 */
TreeLayout = function (elementId, context, config) {
  var self = this;

  // store the project context
  self.context = context;

  // set the default config
  self.config = config || {};
  _.defaults(self.config, DocTreeConfig.tree);

  // initialize the master node list and link list
  self.focusNodeList = []; // List of nodes which should have focus
  self.scale = 1; // Default scale for the main tree view
  self.translation = [0, 0]; // Default translation for the main tree view
  self.nodeStateCache = {}; // Cache for storing node state information between template views

  // New state storage structure
  self.state = {
    initialized: false,
    focusedNodes: [],
    selectedNodes: [],
    edit: {},
    inDrag: false
  };

  // New view state storage
  self.view = {
    width: $(window).innerWidth(),
    height: $(window).innerHeight(),
    scale: 1,
    translation: [0, 0]
  };

  // set the width and height to match the window
  self.width = $(window).innerWidth() - parseInt($('body').css('margin-right')) - parseInt($('body').css('margin-left')) * 2;
  self.height = $(window).innerHeight() - parseInt($('body').css('margin-top')) - parseInt($('body').css('margin-bottom')) * 2;

  console.log("self.width: ", self.width);
  console.log("self.height: ", self.height);

  // set the container bounds
  self.layoutRoot = d3.select("#" + elementId);
  $("#" + elementId)
    .height(self.height)
    .width(self.width);

  // Setup the panning-zoomer
  Meteor.log.debug("Configuring zoomer");
  self.zoomer = d3.behavior.zoom(".global-layer")
    .scaleExtent([0.25, 1.5])
    .on("zoom", function () {
      this.scaleAndTranslate(d3.event.scale, d3.event.translate);
    }.bind(self));
  self.layoutRoot.select("#doc-tree-base")
    .call(self.zoomer);

  // setup the main svg element
  Meteor.log.debug("Configuring svg element");
  self.layoutRoot.selectAll(".doc-tree-svg")
    .attr("width", self.width)
    .attr("height", self.height);

  self.focusLayer     = self.layoutRoot.select("#focus-layer");
  self.highlightLayer = self.layoutRoot.select("#highlight-layer");

  // Setup the svg defs section
  self.defs = self.layoutRoot.select(".base-defs");

  // create a text section to show the mouse coordinates
  self.mouseCoordDisplayScreen = self.layoutRoot.select("#doc-tree-base")
    .append("text")
    .attr("id", "mouse-debug-screen")
    .style("fill", "#ccc")
    .attr("x", 10)
    .attr("y", 12);
  self.mouseCoordDisplayLocal = self.layoutRoot.select("#doc-tree-base")
    .append("text")
    .attr("id", "mouse-debug-local")
    .style("fill", "#ccc")
    .attr("x", 10)
    .attr("y", 25);

  // capture mouse move events for help debugging coordinates
  $(window).on("mousemove", self.mouseMove.bind(self));

  // key handler
  $(document).on("keydown", self.keyDown.bind(self));

  // click handler for base element
  $(".doc-tree-svg").on("click", self.baseClickHandler.bind(self));

  // create the node handler
  self.nodeHandler = new TreeNodeHandler(self, self.config.nodes);
  self.nodeHandler.initDefs();

  // create the action handler
  self.actionHandler = new TreeActionHandler(self, self.config.actions);

  // create the node handler
  self.linkHandler = new TreeLinkHandler(self, self.config.links);

  // create inset layout
  self.insetLayout = new TreeInsetLayout(self, self.config.insetLayout);
  self.insetLayout.initDefs();

  // create the node controls
  self.nodeControls = new TreeNodeControls(self, self.config.nodeControls);

  // create the drop-node handler
  self.dropNodeHandler = new TreeDropNodeHandler(self, self.config.dropNodes);

  // create the action controls
  self.actionControls = new TreeActionControls(self, self.config.nodeControls);
};

/**
 * Setup the initial view
 */
TreeLayout.prototype.init = function () {
  var self = this;

  Meteor.log.info("TreeLayout.init");
  this.scaleAndTranslate(self.scale, self.translation);

  // figure out the max depth that we need to expand to
  var maxDepth = treeUtils.getMaxDepth(self.nodeHandler.getNodes(), function (d) { return d.logExpanded && !d.visExpanded; }) + 1,
    duration = maxDepth * self.config.initialDuration;

  // initialize the inset layout
  self.insetLayout.init();
  self.nodeControls.init();
  self.actionControls.init();

  // make sure there is correct data
  if(!self.nodeHandler.getRootNodes().length){
    throw new Error("TreeLayout.init failed: no root nodes");
  }

  // Expand the root nodes
  _.each(self.nodeHandler.getRootNodes(), function (node, i) {
    setTimeout(function () {
      self.startExpand(node, duration);
    }, duration * (i + 1));
  });

  self.state.initialized = true;
};

/**
 * Scrub all of the source data and update all of the links
 */
TreeLayout.prototype.prepData = function () {
  var self = this;

  // Initialize the link data
  self.linkHandler.prepLinks();

  // Update the nodes
  self.nodeHandler.prepNodes();

  // Invalidate all of the unused links
  self.linkHandler.cleanLinks();

  // Update the actions
  self.actionHandler.prepActions();
};

/**
 * Resize to fix the window
 */
TreeLayout.prototype.resize = function () {
  var self = this;

  Meteor.log.debug("Window resize");
  // Measure the new dimensions
  self.width = $(window).innerWidth() - parseInt($('body').css('margin-right')) - parseInt($('body').css('margin-left'));
  self.height = $(window).innerHeight() - parseInt($('body').css('margin-top')) - parseInt($('body').css('margin-bottom'));

  console.log("resize self.width: ", self.width);
  console.log("resize self.height: ", self.height);

  // Update the root element
  self.layoutRoot.selectAll(".doc-tree-svg")
    .attr("width", self.width)
    .attr("height", self.height);

  // Update the main container
  $("#doc-tree-container")
    .height(self.height)
    .width(self.width);

  // Update the display
  if(self.state.initialized){
    self.update();
  }
};

/**
 * Keydown event handler
 */
TreeLayout.prototype.keyDown = function (e) {
  //Meteor.log.debug("Key down: ", e.which);
  if (e.which === 8 && $(e.target).prop("tagName").toLowerCase() !== 'input') {
    e.preventDefault();
    e.stopPropagation();

    // Check for a node selection
    if ($("svg .node-selected").length) {
      Meteor.log.debug("Selection found, passing to node confirmDelete");
      var nodeList = this.getSelectedNodes();
      this.confirmDeleteNodes(nodeList);
    }
  }
};

/**
 * Destroy!
 */
TreeLayout.prototype.destroy = function () {
  Meteor.log.info("Destroy Called: Removing event handlers");
  $(window).unbind("mousemove");
  $(document).unbind("keydown");
  $(".doc-tree-svg").unbind("click");
};

/**
 * Mouse Move event handler
 */
TreeLayout.prototype.mouseMove = function (e) {
  var local = this.screenToLocalCoordinates({x: e.clientX, y: e.clientY});
  this.mouseCoordDisplayScreen.text("screen: " + e.clientX + ", " + e.clientY);
  this.mouseCoordDisplayLocal.text("local: " + parseInt(local.x) + ", " + parseInt(local.y));
};

/**
 * Get the selected nodes
 * @param node
 */
TreeLayout.prototype.getSelectedNodes = function () {
  Meteor.log.info("getSelectedNodes");
  var selectedNodes = [];
  this.nodeHandler.layer.selectAll(".node-selected").each(function (d, i) {
    if (d) {
      selectedNodes.push(d);
    } else {
      Meteor.log.error("Found null node during getSelected");
    }
  });

  return selectedNodes;
};

/**
 * Confirm that a nodeList should be deleted
 * @param node
 */
TreeLayout.prototype.confirmDeleteNodes = function (nodeList) {
  Meteor.log.info("confirmDeleteNodes: " + nodeList.length);
  var self = this,
    rootList = [].concat(nodeList);

  // expand the list of selected nodes to include all decendents
  _.each(rootList, function (node) {
    nodeList = nodeList.concat(self.nodeHandler.getDescendants(node));
  });
  nodeList = _.uniq(nodeList);
  Meteor.log.debug("Full delete list: " + nodeList.length + " nodes");

  // clone the node state prior to disrupting it
  self.savedNodeState = _.clone(self.nodeStateCache);

  // set every node to logExpanded = true
  _.each(nodeList, function (node) {
    if (!node.visExpanded && (node.childPages.length || node.childViews.length)) {
      node.logExpanded = true;
      node.visExpanded = true;
    }
  });

  // update the graph
  self.update();

  // make sure the update is complete and highlight the nodes
  setTimeout(function () {
    var bounds = self.highlightNodes(nodeList, true);

    // cache the current view so we can restore it
    self.cacheView();

    // the dialog portion doesn't get scaled and this affects the fitAndCenter
    bounds.unscaled = {
      width: self.config.dialogWidth + self.config.highlightSurroundMargin,
      height: self.config.dialogHeight + self.config.highlightSurroundMargin
    };

    // center the content and fit it on screen
    self.fitAndCenter(bounds, function () {
      var scaledBounds = treeUtils.nodeListBounds(nodeList, self.config.highlightSurroundMargin),
        screenBounds = self.localToScreenCoordinates(scaledBounds);

      Dialog.show({
        top: screenBounds.y,
        left: screenBounds.x + screenBounds.width + self.config.highlightSurroundMargin,
        width: self.config.dialogWidth,
        centered: false,
        modal: false,
        contentTemplate: "confirm_delete_nodes_modal",
        title: "Please Confirm",
        buttons: [
          { text: "Cancel" },
          { text: "Delete" }
        ],
        callback: function (btn) {
          self.removeHighlight();
          self.restoreCachedView(self.config.stepDuration);
          if (btn === "Delete") {
            // delete the nodes
            for (var i in nodeList){
              self.deleteNode(nodeList[i]);
            }
          } else {
            // if the user cancelled, restore the original state
            self.nodeStateCache = self.savedNodeState;
            self.savedNodeState = {};
            self.restoreCachedNodeState();
            self.update();
          }
          Dialog.hide();
        }
      });
    });
  }, self.config.viewTransitionTime);
};

/**
 * Delete a single node
 * @param node
 */
TreeLayout.prototype.deleteNode = function(node){
  Meteor.log.debug("Deleting node: " + node._id + " (" + node.title + ")");

  Meteor.call("deleteNode", node._id, function (error, response) {
    if(!error){
      Meteor.log.info("Deleted node: ", node._id);
    } else {
      Meteor.log.error("Error deleting node: ", error);
    }
  });
};

/**
 * Highlight a list of nodes
 * @param nodeList
 */
TreeLayout.prototype.highlightNodes = function(nodeList, forceExpand){
  var self = this;

  // clean up
  $(this.highlightLayer).empty();
  forceExpand = forceExpand || false;

  // create the background
  Meteor.log.debug("Creating background");
  this.highlightLayer.append("rect")
    .attr("class", "background")
    .attr("x", -10000)
    .attr("y", -10000)
    .attr("width", 20000)
    .attr("height", 20000);

  // get the bounding box for the selected nodes
  Meteor.log.debug("Getting bounding box");
  var bounds = treeUtils.nodeListBounds(nodeList, this.config.highlightSurroundMargin);
  //Meteor.log.debug("Bounds: " + JSON.stringify(bounds));

  // add an extra background
  this.highlightLayer.append("rect")
    .attr("class", "background")
    .attr("x", bounds.x)
    .attr("y", bounds.y)
    .attr("rx", this.config.highlightSurroundMargin / 2)
    .attr("ry", this.config.highlightSurroundMargin / 2 )
    .attr("width", bounds.width)
    .attr("height", bounds.height);

  // clone each node in the nodeList
  for(var i in nodeList){
    var node = self.layoutRoot.select("#node_" + nodeList[i]._id).node();
    try {
      // Clone the main group
      this.highlightLayer.node().appendChild(node.cloneNode(true));
    } catch(e) {
      Meteor.log.error("Error Cloning node: " + e);
      Meteor.log.debug(e);
    }
  }

  // Make sure everything is "selected"
  this.highlightLayer.selectAll(".node").classed("node-selected", true);

  // add the surround last so that is has maximum z status
  this.highlightLayer.append("rect")
    .attr("class", "surround")
    .attr("x", bounds.x)
    .attr("y", bounds.y)
    .attr("rx", this.config.highlightSurroundMargin / 2)
    .attr("ry", this.config.highlightSurroundMargin / 2 )
    .attr("width", bounds.width)
    .attr("height", bounds.height);

  // show the layer
  this.highlightLayer.attr("style", "display: inline;");

  // return the bounds of the highlight
  return bounds;
};

/**
 * Get rid of the highlight overlay
 */
TreeLayout.prototype.removeHighlight = function(){
  this.highlightLayer.attr("style", "");
  $(this.highlightLayer.node()).empty();
};

/**
 * Cache the current view settings
 */
TreeLayout.prototype.cacheView = function () {
  this.viewCache = {
    scale: this.scale,
    translation: this.translation.slice()
  };
};

/**
 * Restore the cached view settings
 */
TreeLayout.prototype.restoreCachedView = function (duration, callback) {
  if(this.viewCache){
    this.scaleAndTranslate(this.viewCache.scale, this.viewCache.translation, callback, duration);
    delete this.viewCache;
  }
};

/**
 * Initiate a expand routine for a given node and a given overall duration
 * @param node The node to expand
 * @param duration The overall duration of the expand, will be split for each step
 */
TreeLayout.prototype.startExpand = function(node, duration){
  var nodeList = [node].concat(this.nodeHandler.getDescendants(node, function(d){ return d.parent.logExpanded; })),
    maxDepth = treeUtils.getMaxDepth(nodeList, function(d){ return d.logExpanded && !d.visExpanded; }) + 1;

  if(duration === undefined){
    duration = this.config.stepDuration;
  } else{
    duration = Math.max(duration / (maxDepth - node.depth), 0);
  }

  this.expand(nodeList, node.depth, duration, node);
};

/**
 * Execute a step of an expand routine
 * @param nodeList The nodes to expand
 * @param depth The depth to expand to
 * @param duration The duration of the expand step
 */
TreeLayout.prototype.expand = function(nodeList, depth, duration, rootNode){
  // search for unexpanded (visually) nodes that should be (logically)
  var depthNodes    = treeUtils.getAtDepth(nodeList, depth),
    anotherLevel  = false;
  for(var i in depthNodes){
    if(depthNodes[i].logExpanded === true && depthNodes[i].visExpanded === false){
      depthNodes[i].visExpanded = true;
      anotherLevel = true;
    }
  }

  if(anotherLevel){
    // if the duration is greater than 0, chain the transitions, otherwise call sequentially
    if(duration > 0) {
      this.update(duration);
      setTimeout(function(){
        this.expand(nodeList, depth + 1, duration, rootNode);
      }.bind(this), duration);
    } else {
      this.expand(nodeList, depth + 1, duration, rootNode);
    }
  } else {
    this.cacheNodeState();
    if(duration < 1){
      // if this was a zero-duration expand, only do the update once complete
      this.update();
    }
  }
};

/**
 * Initiate a collapse of a node
 * @param node The node to collapse
 * @param duration The overall duration of the collapse
 */
TreeLayout.prototype.startCollapse = function(node, duration){
  console.log("StartCollapse: ", duration);
  var nodeList = this.nodeHandler.getDescendants(node, function(d){ return d.parent.visExpanded; }),
    maxDepth = treeUtils.getMaxDepth(nodeList);

  if(duration === undefined){
    duration = this.config.stepDuration;
  } else {
    duration = duration / (maxDepth - node.depth);
  }

  this.collapse(nodeList, maxDepth, node.depth, duration);
};

/**
 * Execute a collapse
 * @param nodeList The list of nodes to consider for collapse
 * @param fromDepth The depth to start the collapse at
 * @param toDepth The depth to stop the collapse at
 * @param duration The duration of each collapse step
 */
TreeLayout.prototype.collapse = function(nodeList, fromDepth, toDepth, duration){
  Meteor.log.debug('Collapsing nodes from depth: ' + fromDepth + ' to: ' + toDepth + " in " + duration);

  // search for unexpanded (visually) nodes that should be (logically)
  var depthNodes      = treeUtils.getAtDepth(nodeList, fromDepth),
    updateRequired  = false;
  for(var i in depthNodes){
    if(depthNodes[i].parent.visExpanded === true){
      depthNodes[i].parent.visExpanded = false;
      updateRequired = true;
    }
  }

  if(updateRequired){
    this.update(duration);
  }

  if(fromDepth - 1 > toDepth){
    if(duration > 0) {
      setTimeout(function(){
        this.collapse(nodeList, fromDepth - 1, toDepth, duration);
      }.bind(this), duration);
    } else {
      this.collapse(nodeList, fromDepth - 1, toDepth, duration);
    }
  } else {
    this.cacheNodeState();
    if(duration < 1){
      this.update();
    }
  }
};

/**
 * Convert screen coordinates into local coordinates for the globalLayer
 * @param point
 * @returns {*}
 */
TreeLayout.prototype.screenToLocalCoordinates = function(point){
  var p = _.clone(point);

  if(p.x){
    p.x = (p.x - this.translation[0]) / this.scale;
  }

  if(p.y){
    p.y = (p.y - this.translation[1]) / this.scale;
  }

  if(p.width){
    p.width = p.width / this.scale;
  }

  if(p.height){
    p.height = p.height / this.scale;
  }

  return p;
};

/**
 * Convert local coordinates for the globalLayer into screen coordinates
 * @param point
 * @returns {*}
 */
TreeLayout.prototype.localToScreenCoordinates = function(point){
  var p = _.clone(point);

  if(p.x){
    p.x = this.translation[0] + p.x * this.scale;
  }

  if(p.y){
    p.y = this.translation[1] + p.y * this.scale;
  }

  if(p.width){
    p.width = p.width * this.scale;
  }

  if(p.height){
    p.height = p.height * this.scale;
  }

  return p;
};

/**
 * Scale and translate the global layer in order to fit a rect on the page
 * @param rect
 */
TreeLayout.prototype.fitAndCenter = function(rect, callback){
  var self = this;

  Meteor.log.debug("Fit and center");
  var r = this.localToScreenCoordinates(rect),
    contentWindow = {
      x: self.insetLayout.config.radius * 2 + self.insetLayout.config.margin * 2,
      y: self.insetLayout.config.margin,
      width: this.width - self.insetLayout.config.radius * 2 - self.insetLayout.config.margin * 3,
      height: this.height - self.insetLayout.config.margin * 2
    },
    proposedScale = 1,
    proposedTranslation,
    proposedWidth = r.width + (typeof r.unscaled !== "undefined" ? r.unscaled.width / this.scale : 0);

  /*
  self.layoutRoot.select("#doc-tree-base").append("rect")
    .attr("fill", "none")
    .attr("stroke", "#0f0")
    .attr("x", contentWindow.x)
    .attr("y", contentWindow.y)
    .attr("width", contentWindow.width)
    .attr("height", contentWindow.height);
   */

  // Make a first pass to get the scale
  for(var i = 0; i < 10; i++){
    proposedScale = Math.min(
      contentWindow.width / proposedWidth,
      contentWindow.height / r.height,
      1 // don't zoom in
    );
    // calculate the width in screen coordinates for the scaling
    proposedWidth = r.width + (typeof r.unscaled !== "undefined" ? r.unscaled.width / proposedScale : 0);
  }

  // combine the relative proposed scale and the current scale for an absolute scale
  proposedScale *= this.scale;

  // calculate the width in graph coordinates for the centering
  proposedWidth = rect.width + (typeof r.unscaled !== "undefined" ? r.unscaled.width / proposedScale : 0);

  /*
  this.highlightLayer.append("rect")
    .attr("fill", "none")
    .attr("stroke", "#f00")
    .attr("x", rect.x)
    .attr("y", rect.y)
    .attr("width", rect.width)
    .attr("height", rect.height);

  this.highlightLayer.append("rect")
    .attr("fill", "none")
    .attr("stroke", "#f00")
    .attr("x", rect.x)
    .attr("y", rect.y)
    .attr("width", proposedWidth)
    .attr("height", rect.height);
  */

  // calculate the horizontal centering
  proposedTranslation = [
    contentWindow.x - rect.x * proposedScale + (contentWindow.width - proposedWidth * proposedScale) / 2,
    contentWindow.y - rect.y * proposedScale
  ];

  // apply the scale and translation
  this.scaleAndTranslate(proposedScale, proposedTranslation, callback, this.config.viewTransitionTime);
};

/**
 * Scale and translate the global layer in order to fit a rect on the page
 * @param rect
 */
TreeLayout.prototype.fitAndCenterWithMargin = function(rect, margin, callback){
  var self = this;

  var r = this.localToScreenCoordinates(rect),
    contentWindow = {
      x: self.insetLayout.config.radius * 2 + self.insetLayout.config.margin * 2 + (margin.left || 0),
      y: self.insetLayout.config.margin + (margin.top || 0),
      width: this.width - self.insetLayout.config.radius * 2 - self.insetLayout.config.margin * 3 - (margin.left || 0) - (margin.right || 0),
      height: this.height - self.insetLayout.config.margin * 2 - (margin.top || 0) - (margin.bottom || 0)
    },
    proposedScale = 1,
    proposedTranslation,
    proposedWidth = r.width + (typeof r.unscaled !== "undefined" ? r.unscaled.width / this.scale : 0);

  // Make a first pass to get the scale
  for(var i = 0; i < 10; i++){
    proposedScale = Math.min(
      contentWindow.width / proposedWidth,
      contentWindow.height / r.height,
      1 // don't zoom in
    );
    // calculate the width in screen coordinates for the scaling
    proposedWidth = r.width + (typeof r.unscaled !== "undefined" ? r.unscaled.width / proposedScale : 0);
  }

  // combine the relative proposed scale and the current scale for an absolute scale
  proposedScale *= this.scale;

  // calculate the width in graph coordinates for the centering
  proposedWidth = rect.width + (typeof r.unscaled !== "undefined" ? r.unscaled.width / proposedScale : 0);

  // calculate the horizontal centering
  proposedTranslation = this.translation.slice();

  // filter the proposed translation to only be what is required
  if(r.x < contentWindow.x || (r.x + r.width) > (contentWindow.x + contentWindow.width)){
    proposedTranslation[0] = contentWindow.x - rect.x * proposedScale + (contentWindow.width - proposedWidth * proposedScale) / 2;
  }
  if(r.y < contentWindow.y || (r.y + r.height) > (contentWindow.y + contentWindow.height)){
    if(r.y < contentWindow.y) {
      proposedTranslation[1] = contentWindow.y - rect.y * proposedScale;
    } else {
      proposedTranslation[1] = contentWindow.y + contentWindow.height - (rect.y + rect.height) * proposedScale;
    }
  }

  // apply the scale and translation
  this.scaleAndTranslate(proposedScale, proposedTranslation, callback, this.config.viewTransitionTime);
};

/**
 * Scale and translate the content layers
 * @param scale
 * @param translation
 * @param callback // callback function to call once the transition is complete
 * @param duration // the duration of the transition animation
 */
TreeLayout.prototype.scaleAndTranslate = function (scale, translation, callback, duration) {
  var self = this;

  // enact a floor on the y translation
  translation[1] = translation[1] > 0 ? 0 : translation[1];

  // update the internal accounting
  this.scale = scale;
  this.translation = translation;
  this.zoomer.scale(scale);
  this.zoomer.translate(translation);

  // translate and scale the inset viewport
  self.insetLayout.updateViewport();

  //Meteor.log.debug("scale: ", scale);
  //Meteor.log.debug("translation: ", translation);
  Session.set("viewState", {
    scale: this.scale,
    translation: this.translation.slice()
  });

  //this.updateFocusedNodes();

  if (duration !== undefined) {
    self.layoutRoot.selectAll(".global-layer, #highlight-layer")
      .transition()
      .ease("sin")
      .duration(duration)
      .attr("transform", "translate(" + this.translation + ") scale(" + this.scale + ")")
      .each("end", _.once(function(){
        if (typeof callback === "function") {
          callback();
        }
      }));

  } else {
    self.layoutRoot.selectAll(".global-layer, #highlight-layer")
      .attr("transform", "translate(" + this.translation + ") scale(" + this.scale + ")");

    if(typeof callback === "function"){
      callback();
    }
  }
};

/**
 * Remove focus from all focused nodes
 */
TreeLayout.prototype.clearFocusedNodes = function () {
  var self = this;
  if(self.focusNodeList.length){
    _.each(self.focusNodeList, function(node){
      node.focus = false;
      FocusNodes.remove({ _id: node._id });
      self.nodeStateCache[node._id].focus = false;
    });
    self.focusNodeList = [];
    self.update();
  }
};

/**
 * After a data update, the focused node list needs to be reconstructed
 */
TreeLayout.prototype.restoreFocusedNodeList = function () {
  var self = this;
  this.focusNodeList = [];
  FocusNodes.find().forEach(function(mNode){
    var node = self.getNode(mNode._id);
    if(node){
      self.focusNodeList.push(node);
    } else {
      FocusNodes.remove({ _id: mNode._id });
    }
  });
  Meteor.log.debug('FocusNodeList: ', this.focusNodeList);
  Meteor.log.debug('FocusNodes: ', FocusNodes.find().fetch());
};

/**
 * Toggle the focus state of a node
 * @param d
 */
TreeLayout.prototype.toggleNodeFocus = function (d) {
  d.focus = !d.focus;

  if(d.focus){
    this.focusNodeList.push(d);

    var clone = this.localToScreenCoordinates({
      _id: d._id,
      title: d.title,
      x: d.x + d.bounds.left,
      y: d.y + d.bounds.top,
      scale: this.scale
    });

    // we don't want to scale the width and height, they'll be scaled by css
    clone.width = d.bounds.width;
    clone.height = d.bounds.height;

    FocusNodes.insert(clone);
  } else {
    var found = false, foundIndex = 0;
    _.each(this.focusNodeList, function(node, i){
      if(!found){
        found = node._id === d._id;
        if(found){
          foundIndex = i;
        }
      }
    });
    if(found){
      this.focusNodeList.splice(foundIndex, 1);
      FocusNodes.remove({ _id: d._id });
    }
  }

  // keep the cache up to date
  this.nodeStateCache[d._id].focus = d.focus;

  this.update();
};

/**
 * Take a list of nodes and fit them to the screen
 * @param nodeList
 * @param margin
 * @param callback
 */
TreeLayout.prototype.zoomAndCenterNodes = function (nodeList, margin, callback) {
  // get the bounds of the nodes
  var bounds = treeUtils.nodeListBounds(nodeList, this.config.highlightSurroundMargin);

  // cache the current view so we can restore it
  if(!this.viewCache){
    this.cacheView();
  }

  // center the content and fit it on screen
  this.fitAndCenterWithMargin(bounds, margin, function () {
    if(callback){
      callback.call(this);
    }
  }.bind(this));
};

/**
 * Handle clicks on the base of the chart
 */
TreeLayout.prototype.baseClickHandler = function(e){
  var self = this;

  // make sure the click is actually on the base element
  if (d3.select(e.target).classed("doc-tree-svg")) {
    //Meteor.log.debug("Global click: ", e.target);

    // clear the selection
    self.layoutRoot.selectAll('.node-selected').classed("node-selected", false);

    // clear the shown actions
    self.actionHandler.clearVisibleActions();

    // hide the drawers if they're shown
    if($(".drawer-right").css("display") !== "none"){
      //hideRightDrawer();
    }
    if($(".drawer-bottom").css("display") !== "none"){
      BottomDrawer.hide();
    }

    // hide the node controls
    self.nodeControls.hide();

    // clear any focus from nodes
    this.clearFocusedNodes();
  }
};

/**
 * Filter click events so as to not fire a click if it's really a double click
 * @param d
 */
TreeLayout.prototype.nodeClickFilter = function (d) {
  // check to see if there is a recent click event that could be part of a double
  var self = this,
    event = d3.event,
    now = Date.now();

  if(event.type.toLowerCase() === "dblclick"){
    // cancel the timeout that will fire the click event
    Meteor.clearTimeout(self.clickEvent.timeout);

    // fire the double click handler
    self.nodeDblClickHandler(event, d);
  } else {
    // clear any existing click timeout
    if(self.clickEvent && self.clickEvent.timeout){
      Meteor.clearTimeout(self.clickEvent.timeout);
    }

    // set a timeout to allow for a double-click
    self.clickEvent = {
      timeStamp: now,
      target: event.target,
      timeout: Meteor.setTimeout(function () {
        this.nodeClickHandler(event, d);
      }.bind(self), self.config.dblClickTimeout)
    };
  }
};

/**
 * Front line event handler for clicks on nodes
 */
TreeLayout.prototype.nodeClickHandler = function(e, d){
  var self = this;

  Meteor.log.debug('click: ' + d._id + " (" +  d.title + ")");

  // fetch the node fresh, sometimes the click events get stale data
  var node = self.nodeHandler.getNode(d._id),
    nodeSelect = self.layoutRoot.select("#node_" + d._id + " .node");

  //Meteor.log.debug(node);
  if(e.shiftKey){
    // toggle select the node clicked
    var selected = nodeSelect.classed("node-selected");
    nodeSelect.classed("node-selected", !selected);
  } else if(e.altKey) {
    // toggle the focus state
    self.toggleNodeFocus(node);
  } else {
    // clear any selection
    self.layoutRoot.selectAll('.node-selected').classed("node-selected", false);
    //nodeSelect.classed("node-selected", true);

    self.nodeControls.show(d);
    // Edit the node
    //self.nodeHandler.editNode(node);
  }
};

/**
 * Front line event handler for double-clicks on nodes
 */
TreeLayout.prototype.nodeDblClickHandler = function(e, d){
  Meteor.log.debug('dblClick: ' + d._id + " (" +  d.title + ")");
  var self = this,
    node = self.nodeHandler.getNode(d._id); // fetch the node fresh, sometimes the click events get stale data

  // Take the event out of circulation
  e.stopPropagation();

  // Toggle the node expansion
  if(node.childPages.length || node.childViews.length){
    node.logExpanded = !node.logExpanded;
    if(node.childPages.length || node.childViews.length){
      if(node.logExpanded){
        Meteor.log.debug('StartExpand');
        self.startExpand(node);
      } else {
        Meteor.log.debug('StartCollapse');
        self.startCollapse(node);
      }
    }
  } else {
    Meteor.log.debug('No children: ', node);
  }
};

/**
 * React to the cursor entering a node
 * @param d
 */
TreeLayout.prototype.nodeMouseEnterHandler = function (d) {
  var self = this;

  //Meteor.log.debug("mouseenter: ", d);
  if(!self.state.inDrag){
    // Make sure the node contols don't hide if they're visible for this node
    if(self.nodeControls.node && self.nodeControls.node._id == d._id){
      self.nodeControls.cancelHiding();
    }

    // show the actions for this node
    self.showActionsTimeout = setTimeout(function () {
      self.actionHandler.visibleActionList = [d._id];
      self.actionHandler.updateActionDisplay();
      delete self.showActionsTimeout;
    }, 250);
  }
};

/**
 * React to the cursor leaving a node
 * @param d
 */
TreeLayout.prototype.nodeMouseLeaveHandler = function (d) {
  var self = this;

  //Meteor.log.debug("mouseleave: ", d);
  if(!self.state.inDrag){
    // hide the node controls
    //self.nodeControls.considerHiding();

    // cancel the timer to show the controls if it exists
    if(self.showActionsTimeout){
      clearTimeout(self.showActionsTimeout);
    }
  }
};

/**
 * Handle a click event on an action link or label
 * @param d
 */
TreeLayout.prototype.actionClickHandler = function (d) {
  var self = this,
    event = d3.event;

  // Edit the action
  self.actionHandler.editAction(d);
};

/**
 * Handle a right-click event on an action link or label
 * @param d
 */
TreeLayout.prototype.actionRightClickHandler = function (d) {
  var self = this;
};

/**
 * React to the cursor entering an action
 * @param d
 */
TreeLayout.prototype.actionMouseEnterHandler = function (d) {
  //Meteor.log.debug("Action mouseenter: ", d);
  var self = this;

  if(!self.state.inDrag){
    // cancel any hide that is going on
    self.actionHandler.cancelHiding();

    // Show the hover state for this action
    self.actionHandler.hover(d, d3.event);

    // Show the action controls if hovered above a label
    if(d3.select(d3.event.target).classed("action-label")){
      console.log("Show action controls");
      self.actionControls.show(d);
    }
  }
};

/**
 * React to the cursor leaving an action
 * @param d
 */
TreeLayout.prototype.actionMouseLeaveHandler = function (d) {
  //Meteor.log.debug("Action mouseleave: ", d);
  var self = this;

  if(!self.state.inDrag){
    // Consider hiding any hovered actions
    self.actionHandler.considerHiding();

    // Consider hiding the node controls
    self.actionControls.considerHiding();
  }
};

/**
 * Recalculate the content bounds based on the root node
 */
TreeLayout.prototype.updateContentBounds = function () {
  // TODO: Make this work with multiple root nodes
  var rootNode = this.nodeHandler.getRootNodes()[0];

  if(rootNode !== undefined){
    // initialize the bounds
    this.contentBounds = {
      top: rootNode.family.top + rootNode.y,
      bottom: rootNode.family.bottom + rootNode.y,
      left: rootNode.family.left + rootNode.x,
      right: rootNode.family.right + rootNode.x
    };
  } else {
    Meteor.log.error("TreeLayout: no root node!");
  }
};

/**
 * Update the tree layout
 * @param duration The duration to use for the update
 */
TreeLayout.prototype.update = function(duration){
  var self = this;

  // default duration
  duration = duration || self.config.stepDuration;

  // prepare the data for the update
  self.prepData();

  // Update the nodes
  self.nodeHandler.update(duration);

  // Update the links
  self.linkHandler.update(duration);

  // Update the actions
  self.actionHandler.update(duration);

  // Update the inset view
  self.insetLayout.update(duration);

  // update any focused nodes
  //self.updateFocusedNodes(duration);

  // update the controls
  setTimeout(function () {
    self.nodeControls.update();
  }, duration);
};

/**
 * Show the focus state for an nodes that have it
 */
TreeLayout.prototype.updateFocusedNodes = function (duration) {
  //var focusNodeList = this.filterNodeList(this.nodeHandler.getNodes(), function (d) { return d.focus === true; });
  var self = this;

  var focusedNodes = self.focusLayer.selectAll(".focus-group")
    .data(self.focusNodeList, function (d) { return d._id; });

  // Create the base group for newly focused nodes
  var focusedNodesEnter = focusedNodes.enter()
    .append("g")
    .attr("class", "focus-group")
    .attr("id", function(d){ return 'focus_node_' + d._id; })
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  // Create the content
  focusedNodesEnter
    .append("g")
    .attr("transform", function(d) { return "translate(" + d.bounds.left + ", " + d.bounds.top + ")"; })
    .append("rect")
    .attr("class", 'focus-node')
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", function(d) { return d.bounds.width; })
    .attr("height", function(d) { return d.bounds.height; })
    .attr("rx", self.nodeHandler.config.cornerRadius)
    .attr("ry", self.nodeHandler.config.cornerRadius);

  // update any existing focused nodes
  focusedNodes.transition()
    .duration(duration)
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  // remove any nodes that have lost focus
  focusedNodes.exit().remove();

  // update the html layer
  _.each(this.focusNodeList, function(node){
    var update = self.localToScreenCoordinates({
      x: node.x + node.bounds.left,
      y: node.y + node.bounds.top,
      scale: self.scale,
      title: node.title
    });

    // we don't want to scale the width and height, they'll be scaled by css
    update.width = node.bounds.width;
    update.height = node.bounds.height;

    FocusNodes.update({ _id: node._id },
      {$set: update});
  });
};

/**
 * Store the expand state of each node
 */
TreeLayout.prototype.cacheNodeState = function(){
  var self = this;

  // fully erase anything that existed
  self.nodeStateCache = {};

  Meteor.log.debug("Caching Node State");
  _.each(self.nodeHandler.getNodes(), function (node) {
    self.nodeStateCache[ node._id ] = {
      visExpanded: node.visExpanded,
      logExpanded: node.logExpanded,
      focus: node.focus
    };
  });

  Session.set("nodeState", this.nodeStateCache);
};

/**
 * Restore the expand state of the nodes from the cache
 */
TreeLayout.prototype.restoreCachedNodeState = function(){
  var self = this;

  Meteor.log.debug("Restoring Cached Node State");
  _.each(self.nodeHandler.getNodes(), function (node) {
    if(self.nodeStateCache[ node._id ] !== undefined){
      node.visExpanded = self.nodeStateCache[ node._id ].visExpanded;
      node.logExpanded = self.nodeStateCache[ node._id ].logExpanded;
      node.focus = self.nodeStateCache[ node._id ].focus;
    }
  });
};
