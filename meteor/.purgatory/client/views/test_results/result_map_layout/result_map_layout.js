/**
 * Custom layout displaying test result data
 */
ResultMapLayout = function (elementId, context, config) {
  var self = this;

  // store the container element
  self.container = $("#" + elementId);

  // store the project context
  self.context = context;

  // set the default config
  self.config = config || {};
  _.defaults(self.config, DocTreeConfig.tree);

  // New state storage structure
  self.state = {
    inDrag: false
  };

  // New view state storage
  self.view = {
    width: self.container.innerWidth(),
    height: self.container.innerHeight()
  };

  // set the width and height
  self.width = self.container.innerWidth() - parseInt(self.container.css('margin-right')) - parseInt(self.container.css('margin-left')) * 2;
  self.height = self.container.innerHeight() - parseInt(self.container.css('margin-top')) - parseInt(self.container.css('margin-bottom')) * 2;

  // set the container bounds
  self.layoutRoot = d3.select("#" + elementId);

  // setup the main svg element
  console.debug("Configuring svg element");

  // Select frequently used items
  self.defs = self.layoutRoot.select(".base-defs");

  // create the node handler
  self.nodeHandler = new TreeNodeHandler(self, self.config.nodes);
  self.nodeHandler.initDefs();

  // create the action handler
  self.actionHandler = new TreeActionHandler(self, self.config.actions);

  // create the node handler
  self.linkHandler = new TreeLinkHandler(self, self.config.links);
};

/**
 * Setup the initial view
 */
ResultMapLayout.prototype.init = function () {
  var self = this;

  console.info("ResultMapLayout.init");
};

/**
 * Scrub all of the source data and update all of the links
 */
ResultMapLayout.prototype.prepData = function () {
  var self = this;

  // Initialize the link data
  self.linkHandler.prepLinks();

  // Prep the nodes
  _.each(self.nodeHandler.nodeList, function (node, i) {
    node.logExpanded = true;
    node.visExpanded = true;
    self.nodeHandler.calcNodeSize(node);
  });

  // position the nodes
  self.positionNodes();

  // Invalidate all of the unused links
  self.linkHandler.cleanLinks();

  // Update the actions
  self.actionHandler.prepActions();
};

/**
 * Position the nodes (replaces the nodeHandler positioner)
 */
ResultMapLayout.prototype.positionNodes = function () {
  var self = this,
    nodeHandler = self.nodeHandler,
    rootNode = self.getRootNode();

  // initialize the root node
  rootNode.depth = 0;
  rootNode.x = self.width / 2;
  rootNode.y = 0;
  treeUtils.setNodeDepth(rootNode, 0);

  // From the bottom of the tree up, calculate the family local position
  maxDepth = treeUtils.getMaxDepth(self.nodeList);
  for (depth = maxDepth; depth > 0; depth--) {
    _.each(treeUtils.getAtDepth(nodeHandler.nodeList, depth), nodeHandler.positionLocal.bind(nodeHandler));
  }

  // Calculate the family local position of the first level
  nodeHandler.positionLocal(rootNode);

  // from the top down, position the nodes globally
  self.positionGlobal(rootNode);
};

/**
 * Get the root node
 */
ResultMapLayout.prototype.getRootNode = function () {
  return _.filter(this.nodeHandler.nodeList, function (node) { return _.isNull(node.parentId)})[0]
};

/**
 * Destroy!
 */
ResultMapLayout.prototype.destroy = function () {
  console.info("Destroy Called");
};

/**
 * Cache the current view settings
 */
ResultMapLayout.prototype.cacheView = function () {
  // TODO: remove when proven to be not needed
};

/**
 * Restore the cached view settings
 */
ResultMapLayout.prototype.restoreCachedView = function (duration, callback) {
  // TODO: remove when proven to be not needed
};

/**
 * Convert screen coordinates into local coordinates for the globalLayer
 * @param point
 * @returns {*}
 */
ResultMapLayout.prototype.screenToLocalCoordinates = function(point){
  var p = _.clone(point);

  if(p.x != null){
    p.x = (p.x - this.translation[0]) / this.scale;
  }

  if(p.y != null){
    p.y = (p.y - this.translation[1]) / this.scale;
  }

  if(p.width != null){
    p.width = p.width / this.scale;
  }

  if(p.height != null){
    p.height = p.height / this.scale;
  }

  return p;
};

/**
 * Convert local coordinates for the globalLayer into screen coordinates
 * @param point
 * @returns {*}
 */
ResultMapLayout.prototype.localToScreenCoordinates = function(point){
  var p = _.clone(point);

  if(p.x != null){
    p.x = this.translation[0] + p.x * this.scale;
  }

  if(p.y != null){
    p.y = this.translation[1] + p.y * this.scale;
  }

  if(p.width != null){
    p.width = p.width * this.scale;
  }

  if(p.height != null){
    p.height = p.height * this.scale;
  }

  return p;
};

/**
 * Scale and translate the global layer in order to fit a rect on the page
 * @param rect
 */
ResultMapLayout.prototype.fitAndCenter = function(rect, duration, callback){
  // TODO: remove when proven to be not needed
};

/**
 * Zoom and translate the global layer in order to center a rect on the page
 * @param rect
 */
ResultMapLayout.prototype.zoomAndCenter = function(rect, scale, duration, callback){
  // TODO: remove when proven to be not needed
};

/**
 * Scale and translate the content layers
 * @param scale
 * @param translation
 * @param callback // callback function to call once the transition is complete
 * @param duration // the duration of the transition animation
 */
ResultMapLayout.prototype.scaleAndTranslate = function (scale, translation, duration, callback) {
  // TODO: remove when proven to be not needed
};

/**
 * Show the actions for a node
 * @param node
 */
ResultMapLayout.prototype.showNodeActions = function (node) {
  // TODO: remove when proven to be not needed
};

/**
 * Filter click events so as to not fire a click if it's really a double click
 * @param d
 */
ResultMapLayout.prototype.nodeClickFilter = function (d) {
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
ResultMapLayout.prototype.nodeClickHandler = function(e, d){
  console.debug('click: ' + d._id + " (" +  d.title + ")");
  /*
  var self = this;

  // fetch the node fresh, sometimes the click events get stale data
  var node = self.nodeHandler.getNode(d._id),
    nodeSelect = self.layoutRoot.select("#node_" + d._id + " .node");

  //console.debug(node);
  if(e.shiftKey){

  } else if(e.altKey) {

  } else {

  }
  */
};

/**
 * Front line event handler for double-clicks on nodes
 */
ResultMapLayout.prototype.nodeDblClickHandler = function(e, d){
  console.debug('dblClick: ' + d._id + " (" +  d.title + ")");
  /*
  var self = this,
    node = self.nodeHandler.getNode(d._id); // fetch the node fresh, sometimes the click events get stale data

  // Take the event out of circulation
  e.stopPropagation();

  // Toggle the node expansion
  if(node.childPages.length || node.childViews.length){
    node.logExpanded = !node.logExpanded;
    if(node.childPages.length || node.childViews.length){
      if(node.logExpanded){
        console.debug('StartExpand');
        self.startExpand(node);
      } else {
        console.debug('StartCollapse');
        self.startCollapse(node);
      }
    }
  } else {
    console.debug('No children: ', node);
  }
  */
};

/**
 * React to the cursor entering a node
 * @param d
 */
ResultMapLayout.prototype.nodeMouseEnterHandler = function (d) {
  var self = this;

  //console.debug("mouseenter: ", d);
  if(!self.state.inDrag){
    // Make sure the node contols don't hide if they're visible for this node
    /*
     if(self.nodeControls.node && self.nodeControls.node._id == d._id){
     self.nodeControls.cancelHiding();
     }
     */

    // show the actions for this node
    /*
     self.showActionsTimeout = setTimeout(function () {
     self.actionHandler.visibleActionList = [d._id];
     self.actionHandler.updateActionDisplay();
     delete self.showActionsTimeout;
     }, 250);
     */
  }
};

/**
 * React to the cursor leaving a node
 * @param d
 */
ResultMapLayout.prototype.nodeMouseLeaveHandler = function (d) {
  var self = this;

  //console.debug("mouseleave: ", d);
  if(!self.state.inDrag){
    // hide the node controls
    //self.nodeControls.considerHiding();

    // cancel the timer to show the controls if it exists
    /*
     if(self.showActionsTimeout){
     clearTimeout(self.showActionsTimeout);
     }
     */
  }
};

/**
 * Handle a click event on an action link or label
 * @param d
 */
ResultMapLayout.prototype.actionClickHandler = function (d) {
  var self = this,
    event = d3.event;

  // Edit the action
  //self.actionHandler.editAction(d);
};

/**
 * Handle a right-click event on an action link or label
 * @param d
 */
ResultMapLayout.prototype.actionRightClickHandler = function (d) {
  var self = this;
};

/**
 * React to the cursor entering an action
 * @param d
 */
ResultMapLayout.prototype.actionMouseEnterHandler = function (d) {
  //console.debug("Action mouseenter: ", d);
  var self = this;

  if(!self.state.inDrag){
    // Show the hover state for this action
    //self.actionHandler.hover(d, d3.event);

    // Show the action controls if hovered above a label
    if(d3.select(d3.event.target).classed("action-label")){
      //console.log("Show action controls");
      //self.actionControls.show(d);
    }
  }
};

/**
 * React to the cursor leaving an action
 * @param d
 */
ResultMapLayout.prototype.actionMouseLeaveHandler = function (d) {
  //console.debug("Action mouseleave: ", d);
  var self = this;

  if(!self.state.inDrag){
    // Consider hiding any hovered actions
    //self.actionHandler.considerHiding();

    // Consider hiding the node controls
    //self.actionControls.considerHiding();
  }
};

/**
 * Recalculate the content bounds based on the root node
 */
ResultMapLayout.prototype.updateContentBounds = function () {
  // TODO: remove when proven to be not needed
};

/**
 * Update the tree layout
 * @param duration The duration of the update transition
 */
ResultMapLayout.prototype.update = function (duration) {
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
};
