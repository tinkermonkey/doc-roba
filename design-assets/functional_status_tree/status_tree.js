/**
 * Constructor for custom d3 tree layout
 */
StatusTree = function (elementId, config) {
  console.debug("StatusTree constructor");
  var self = this;

  // set the default config
  self.config = config || {};
  _.defaults(self.config, StatusTreeConfig.tree);

  // initialize the master node list and link list
  self.scale = 1; // Default scale for the main tree view
  self.translation = [0, 0]; // Default translation for the main tree view
  self.nodeStateCache = {}; // Cache for storing node state information between template views

  // New state storage structure
  self.state = {
    locked: false,
    initialized: false,
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
  self.width = $(window).innerWidth() - parseInt($("body").css("margin-right")) - parseInt($("body").css("margin-left")) * 2;
  self.height = $(window).innerHeight() - parseInt($("body").css("margin-top")) - parseInt($("body").css("margin-bottom")) * 2;

  console.debug("StatusTree width: " + self.width);
  console.debug("StatusTree height: " + self.height);

  // set the container bounds
  self.layoutRoot = d3.select("#" + elementId);
  $("#" + elementId)
      .height(self.height)
      .width(self.width);

  // make sure that the dom is correct
  console.debug("self.layoutRoot:", self.layoutRoot);
  try {
    self.layoutRoot.attr("id");
  } catch (e) {
    console.error("StatusTree setup failed:", e);
    console.debug("StatusTree root:", $("#" + elementId).get(0), d3.select("#" + elementId));
    throw new Error("StatusTree constructor failed: element #" + elementId);
  }

  // Setup the panning-zoomer
  console.debug("StatusTree Configuring zoomer");
  self.zoomer = d3.behavior.zoom(".global-layer")
      .scaleExtent([0.25, 1.5])
      .on("zoom", function () {
        if(!this.state.locked){
          this.scaleAndTranslate(d3.event.scale, d3.event.translate);
        }
      }.bind(self));
  self.layoutRoot.select("#doc-tree-base")
      .call(self.zoomer);

  // setup the main svg element
  console.debug("StatusTree Configuring svg element");
  self.layoutRoot.selectAll(".doc-tree-svg")
      .attr("width", self.width)
      .attr("height", self.height);

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
  //self.actionHandler = new TreeActionHandler(self, self.config.actions);

  // create the node handler
  self.linkHandler = new TreeLinkHandler(self, self.config.links);

  // create inset layout
  self.insetLayout = new TreeInsetLayout(self, self.config.insetLayout);
  self.insetLayout.initDefs();

  // create the node controls
  //self.nodeControls = new TreeNodeControls(self, self.config.nodeControls);

  // create the drop-node handler
  //self.dropNodeHandler = new TreeDropNodeHandler(self, self.config.dropNodes);

  // create the action controls
  //self.actionControls = new TreeActionControls(self, self.config.nodeControls);
};

/**
 * Setup the initial view
 */
StatusTree.prototype.init = function () {
  console.debug("StatusTree.init");
  var self = this;

  //self.scaleAndTranslate(self.scale, self.translation);

  // figure out the max depth that we need to expand to
  var maxDepth = treeUtils.getMaxDepth(self.nodeHandler.getNodes(), function (d) { return d.logExpanded && !d.visExpanded; }) + 1,
      duration = maxDepth * self.config.initialDuration;

  // initialize the inset layout
  self.insetLayout && self.insetLayout.init();
  self.nodeControls && self.nodeControls.init();
  self.actionControls && self.actionControls.init();

  // make sure there is correct data
  if(!self.nodeHandler.getRootNodes().length){
    throw new Error("StatusTree init failed: no root nodes");
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
StatusTree.prototype.prepData = function () {
  var self = this;

  // Initialize the link data
  self.linkHandler.prepLinks();

  // Update the nodes
  self.nodeHandler.prepNodes();

  // Invalidate all of the unused links
  self.linkHandler.cleanLinks();

  // Update the actions
  //self.actionHandler.prepActions();
};

/**
 * Resize to fix the window
 */
StatusTree.prototype.resize = function () {
  console.debug("StatusTree.resize");
  var self = this;

  // Measure the new dimensions
  self.width = $(window).innerWidth() - parseInt($("body").css("margin-right")) - parseInt($("body").css("margin-left"));
  self.height = $(window).innerHeight() - parseInt($("body").css("margin-top")) - parseInt($("body").css("margin-bottom"));

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
StatusTree.prototype.keyDown = function (e) {
  //console.debug("Key down: ", e.which);
  if (e.which === 8 && $(e.target).prop("tagName").toLowerCase() !== "input") {
    e.preventDefault();
    e.stopPropagation();

    // Check for a node selection
    if ($("svg .node-selected").length) {
      console.debug("StatusTree keyDown selection found for delete key, passing to node confirmDelete");
      var nodeList = this.getSelectedNodes();
      this.confirmDeleteNodes(nodeList);
    }
  }
};

/**
 * Lock the view
 */
StatusTree.prototype.lock = function () {
  this.state.locked = true
};

/**
 * Unlock the view
 */
StatusTree.prototype.unlock = function () {
  this.state.locked = false
};

/**
 * Destroy!
 */
StatusTree.prototype.destroy = function () {
  console.debug("StatusTree.destroy");
  $(window).unbind("mousemove");
  $(document).unbind("keydown");
  $(".doc-tree-svg").unbind("click");
};

/**
 * Mouse Move event handler
 */
StatusTree.prototype.mouseMove = function (e) {
  var local = this.screenToLocalCoordinates({x: e.clientX, y: e.clientY});
  this.mouseCoordDisplayScreen.text("screen: " + e.clientX + ", " + e.clientY);
  this.mouseCoordDisplayLocal.text("local: " + parseInt(local.x) + ", " + parseInt(local.y));
};

/**
 * Get the selected nodes
 * @param node
 */
StatusTree.prototype.getSelectedNodes = function () {
  console.debug("StatusTree.getSelectedNodes");
  var selectedNodes = [];
  this.nodeHandler.layer.selectAll(".node-selected").each(function (d, i) {
    if (d) {
      selectedNodes.push(d);
    } else {
      console.error("StatusTree getSelectedNodes found null node during getSelected");
    }
  });

  return selectedNodes;
};

/**
 * Confirm that a nodeList should be deleted
 * @param node
 */
StatusTree.prototype.confirmDeleteNodes = function (nodeList) {
  console.debug("StatusTree.confirmDeleteNodes: " + nodeList.length);
  var self = this,
      rootList = [].concat(nodeList);

  // expand the list of selected nodes to include all decendents
  _.each(rootList, function (node) {
    nodeList = nodeList.concat(self.nodeHandler.getDescendants(node));
  });
  nodeList = _.uniq(nodeList);
  console.debug("StatusTree full delete list: " + nodeList.length + " nodes");

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
StatusTree.prototype.deleteNode = function(node){
  console.debug("StatusTree.deleteNode: " + node._id + " (" + node.title + ")");
  var self = this;

  Meteor.call("deleteNode", node._id, function (error, response) {
    if(!error){
      console.info("StatusTree deleted node: " + node._id);
      self.nodeControls.hide();
    } else {
      console.error("StatusTree error deleting node: " + error);
    }
  });
};

/**
 * Highlight a list of nodes
 * @param nodeList
 */
StatusTree.prototype.highlightNodes = function(nodeList, forceExpand){
  console.debug("StatusTree.highlightNodes");
  var self = this;

  // clean up
  $(this.highlightLayer).empty();
  forceExpand = forceExpand || false;

  // create the background
  this.highlightLayer.append("rect")
      .attr("class", "background")
      .attr("x", -10000)
      .attr("y", -10000)
      .attr("width", 20000)
      .attr("height", 20000);

  // get the bounding box for the selected nodes
  console.debug("StatusTree.highlightNodes: getting bounding box");
  var bounds = treeUtils.nodeListBounds(nodeList, this.config.highlightSurroundMargin);
  //console.debug("Bounds: " + JSON.stringify(bounds));

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
      console.error("StatusTree.highlightNodes: error Cloning node: " + e.toString());
      console.log(e);
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
StatusTree.prototype.removeHighlight = function(){
  console.debug("StatusTree.removeHighlight");
  this.highlightLayer.attr("style", "");
  $(this.highlightLayer.node()).empty();
};

/**
 * Cache the current view settings
 */
StatusTree.prototype.cacheView = function () {
  console.debug("StatusTree.cacheView");
  this.viewCache = {
    scale: this.scale,
    translation: this.translation.slice()
  };
};

/**
 * Restore the cached view settings
 */
StatusTree.prototype.restoreCachedView = function (duration, callback) {
  console.debug("StatusTree.restoreCachedView");
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
StatusTree.prototype.startExpand = function(node, duration){
  console.debug("StatusTree.startExpand");
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
StatusTree.prototype.expand = function(nodeList, depth, duration, rootNode){
  //console.debug("StatusTree.expand");
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
StatusTree.prototype.startCollapse = function(node, duration){
  //console.debug("StatusTree.startCollapse");
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
StatusTree.prototype.collapse = function(nodeList, fromDepth, toDepth, duration){
  console.debug("StatusTree.collapse nodes from depth: " + fromDepth + " to: " + toDepth + " in " + duration);

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
StatusTree.prototype.screenToLocalCoordinates = function(point){
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
StatusTree.prototype.localToScreenCoordinates = function(point){
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
StatusTree.prototype.fitAndCenter = function(rect, callback){
  console.debug("StatusTree.fitAndCenter");
  var self = this;

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
StatusTree.prototype.fitAndCenterWithMargin = function(rect, margin, callback){
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
StatusTree.prototype.scaleAndTranslate = function (scale, translation, callback, duration) {
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

  //console.debug("StatusTree scaleAndTranslate scale: ", scale);
  //console.debug("StatusTree scaleAndTranslate translation: ", translation);
  /*
  Session.set("viewState", {
    scale: this.scale,
    translation: this.translation.slice()
  });
  */

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
 * Take a list of nodes and fit them to the screen
 * @param nodeList
 * @param margin
 * @param callback
 */
StatusTree.prototype.zoomAndCenterNodes = function (nodeList, margin, callback) {
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
StatusTree.prototype.baseClickHandler = function(e){
  var self = this;

  // make sure the click is actually on the base element
  if (d3.select(e.target).classed("doc-tree-svg")) {
    //console.debug("StatusTree baseClickHandler global click: ", e.target);

    // clear the selection
    self.layoutRoot.selectAll(".node-selected").classed("node-selected", false);

    // clear the shown actions
    if(self.actionHandler){
      self.actionHandler.clearVisibleActions();
    }

    // hide the node controls
    if(self.nodeControls){
      self.nodeControls.hide();
    }
  }
};

/**
 * Filter click events so as to not fire a click if it's really a double click
 * @param d
 */
StatusTree.prototype.nodeClickFilter = function (d) {
  // check to see if there is a recent click event that could be part of a double
  var self = this,
      event = d3.event,
      now = Date.now();

  if(event.type.toLowerCase() === "dblclick"){
    // cancel the timeout that will fire the click event
    clearTimeout(self.clickEvent.timeout);

    // fire the double click handler
    self.nodeDblClickHandler(event, d);
  } else {
    // clear any existing click timeout
    if(self.clickEvent && self.clickEvent.timeout){
      clearTimeout(self.clickEvent.timeout);
    }

    // set a timeout to allow for a double-click
    self.clickEvent = {
      timeStamp: now,
      target: event.target,
      timeout: setTimeout(function () {
        this.nodeClickHandler(event, d);
      }.bind(self), self.config.dblClickTimeout)
    };
  }
};

/**
 * Front line event handler for clicks on nodes
 */
StatusTree.prototype.nodeClickHandler = function(e, d){
  var self = this;

  console.debug("StatusTree nodeClickHandler: " + d._id + " (" +  d.title + ")", d);

  // fetch the node fresh, sometimes the click events get stale data
  var node = self.nodeHandler.getNode(d._id),
      nodeSelect = self.layoutRoot.select("#node_" + d._id + " .node");

  //console.log(node);
  if(e.shiftKey){
    // toggle select the node clicked
    var selected = nodeSelect.classed("node-selected");
    nodeSelect.classed("node-selected", !selected);
  } else {
    // clear any selection
    self.layoutRoot.selectAll(".node-selected").classed("node-selected", false);
    //nodeSelect.classed("node-selected", true);

    if(self.nodeControls){
      self.nodeControls.show(d);
    }

    // Edit the node
    //self.nodeHandler.editNode(node);
  }
};

/**
 * Front line event handler for double-clicks on nodes
 */
StatusTree.prototype.nodeDblClickHandler = function(e, d){
  console.debug("StatusTree nodeDblClickHandler: " + d._id + " (" +  d.title + ")");
  var self = this,
      node = self.nodeHandler.getNode(d._id); // fetch the node fresh, sometimes the click events get stale data

  // Take the event out of circulation
  e.stopPropagation();

  // Toggle the node expansion
  if(node.childPages.length || node.childViews.length){
    node.logExpanded = !node.logExpanded;
    if(node.childPages.length || node.childViews.length){
      if(node.logExpanded){
        console.debug("StatusTree nodeDblClickHandler startExpand");
        self.startExpand(node);
      } else {
        console.debug("StatusTree nodeDblClickHandler tartCollapse");
        self.startCollapse(node);
      }
    }
  } else {
    console.debug("StatusTree nodeDblClickHandler no children: " + node._id + " " + node.title);
  }
};

/**
 * React to the cursor entering a node
 * @param d
 */
StatusTree.prototype.nodeMouseEnterHandler = function (d) {
  var self = this;

  //console.debug("StatusTree nodeMouseEnterHandler: " + d._id + " " + d.title);
  if(!self.state.inDrag){
    // Make sure the node contols don't hide if they're visible for this node
    if(self.nodeControls && self.nodeControls.node && self.nodeControls.node._id == d._id){
      self.nodeControls.cancelHiding();
    }

    // show the actions for this node
    if(self.actionHandler){
      self.showActionsTimeout = setTimeout(function () {
        self.actionHandler.visibleActionList = [d._id];
        self.actionHandler.updateActionDisplay();
        delete self.showActionsTimeout;
      }, 250);
    }
  }
};

/**
 * React to the cursor leaving a node
 * @param d
 */
StatusTree.prototype.nodeMouseLeaveHandler = function (d) {
  var self = this;

  //console.debug("StatusTree nodeMouseLeaveHandler: " + d._id + " " + d.title);
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
StatusTree.prototype.actionClickHandler = function (d) {
  var self = this,
      event = d3.event;

  // Edit the action
  self.actionHandler.editAction(d);
};

/**
 * Handle a right-click event on an action link or label
 * @param d
 */
StatusTree.prototype.actionRightClickHandler = function (d) {
  var self = this;
};

/**
 * React to the cursor entering an action
 * @param d
 */
StatusTree.prototype.actionMouseEnterHandler = function (d) {
  //console.debug("StatusTree actionMouseEnterHandler: " + d._id + " " + d.title);
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
StatusTree.prototype.actionMouseLeaveHandler = function (d) {
  //console.debug("StatusTree actionMouseLeaveHandler: " + d._id + " " + d.title);
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
StatusTree.prototype.updateContentBounds = function () {
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
    console.error("StatusTree updateContentBounds: no root node!");
  }
};

/**
 * Update the tree layout
 * @param duration The duration to use for the update
 */
StatusTree.prototype.update = function(duration){
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
  //self.actionHandler.update(duration);

  // Update the inset view
  self.insetLayout.update(duration);

  /*
  // update the controls
  setTimeout(function () {
    self.nodeControls.update();
  }, duration);
  */

  /*
  setTimeout(function () {
    self.actionHandler.update(duration);
  }), 1000;
  */
};

/**
 * Store the expand state of each node
 */
StatusTree.prototype.cacheNodeState = function(){
  var self = this;

  // fully erase anything that existed
  self.nodeStateCache = {};

  console.debug("StatusTree caching node state");
  _.each(self.nodeHandler.getNodes(), function (node) {
    self.nodeStateCache[ node._id ] = {
      visExpanded: node.visExpanded,
      logExpanded: node.logExpanded
    };
  });

  try {
    Session.set("nodeState", this.nodeStateCache);
  } catch (e) {}
};

/**
 * Restore the expand state of the nodes from the cache
 */
StatusTree.prototype.restoreCachedNodeState = function(){
  var self = this;

  console.debug("StatusTree restoring cached node state:", self.nodeStateCache);
  _.each(self.nodeHandler.getNodes(), function (node) {
    if(self.nodeStateCache[ node._id ] !== undefined){
      node.visExpanded = self.nodeStateCache[ node._id ].visExpanded;
      node.logExpanded = self.nodeStateCache[ node._id ].logExpanded;
    }
  });
};

/**
 * Show a popover auto-centered on a node
 * @param node
 */
StatusTree.prototype.popover = function (nodeList, popoverConfig, controls, popoverCallback) {
  var self = this;
  //console.log("Popover nodes:", nodeList);

  var bounds = treeUtils.nodeListBounds(nodeList, self.config.highlightSurroundMargin),
      insetX = self.insetLayout.config.radius * 2 + self.insetLayout.config.margin * 2,
      insetY = $(".main-nav-menu").height() + $(".main-nav-menu").position().top + self.insetLayout.config.margin * 2,
      scale  = self.scale;

  // Auto-scale based on the bounds of the nodes being operated on
  //console.log("Popover bounds:", bounds, insetX, insetY, scale);
  //console.log("Popover Scale: ", (self.width - insetX - self.config.popover.targetWidth) / bounds.width, (self.height - insetY) / bounds.height, scale);
  scale = Math.min(
      (self.width - insetX - self.config.popover.targetWidth - self.insetLayout.config.margin) / bounds.width,
      (self.height - insetY - self.insetLayout.config.margin) / bounds.height,
      scale
  );
  //console.log("Popover Transition:", insetX - bounds.x * scale, insetY - bounds.y * scale);

  self.cacheView();
  self.scaleAndTranslate(scale, [
    insetX - bounds.x * scale,
    insetY - bounds.y * scale
  ], function () {
    // attempt to lock the controls
    try {
      controls.lock();
    } catch (e) {
      console.error("Popover failed to lock controls");
    }

    // lock the layout to prevent unwanted closing
    self.lock();

    // setup the popover config
    popoverConfig.callback = function () {
      console.log("Popover Closed");
      try {
        controls.unlock();
      } catch (e) {
        console.error("Popover failed to unlock controls");
      }
      self.unlock();
      self.restoreCachedView(self.config.popover.transitionTime);
      if(popoverCallback){
        popoverCallback();
      }
    };

    // calculate the minimum widths
    popoverConfig.minHeight = Math.min(self.config.popover.minHeight, self.height * 0.4);
    popoverConfig.minWidth = Math.min(self.config.popover.minWidth, self.width * 0.6);

    // set the target size
    popoverConfig.height = self.config.popover.targetHeight;
    popoverConfig.width = self.config.popover.targetWidth;

    // attempt to get the controls attach point
    try {
      //popoverConfig.sourceElement = controls.attachPoint();
    } catch (e) {
      console.error("Popover failed to obtain control attach point");
    }

    // Wait until the scaleAndTranslate is complete so that the placement is correct
    setTimeout(function () {
      // get the final popover position
      var corner = self.localToScreenCoordinates({
        x: bounds.x + bounds.width,
        y: bounds.y
      });
      //console.log("Popover final bounds: ", bounds, corner);
      popoverConfig.top = corner.y;
      popoverConfig.left = corner.x;

      // Show the popover
      Popover.show(popoverConfig);
    }, self.config.popover.transitionTime);
  }, self.config.popover.transitionTime);
};