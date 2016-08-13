/**
 * Inset layout for the tree layout
 *
 * @param treeLayout The parent TreeLayout object
 * @param config The configuration for this layout
 * @constructor
 */
TreeInsetLayout = function (treeLayout, config) {
  var self = this;

  // Make sure there's a treelayout
  if(!treeLayout){
    console.error("TreeInsetLayout constructor failed: no TreeLayout passed");
    return;
  }
  self.treeLayout = treeLayout;

  // condense the config
  self.config = config || {};
  _.defaults(self.config, StatusTreeConfig.insetView);

  // Build up the inset view and consume any click events that come self way
  self.layer  = self.treeLayout.layoutRoot.select(".inset-layer")
      .attr("transform", "translate(" + [ self.config.margin, self.config.margin ] + ")")
      .on("mousedown", function () {
        d3.event.stopPropagation();
      })
      .on("click", function () {
        d3.event.stopPropagation();
      })
      .on("dblclick", function () {
        d3.event.stopPropagation();
      });

  // Setup the inset view
  self.layer.select(".inset-frame")
      .attr("cx", self.config.radius)
      .attr("cy", self.config.radius)
      .attr("r", self.config.radius - 1);
  self.content    = self.treeLayout.layoutRoot.select(".inset-content");
  self.linkLayer  = self.treeLayout.layoutRoot.select(".inset-link-layer");
  self.nodeLayer  = self.treeLayout.layoutRoot.select(".inset-node-layer");
  self.viewport   = self.treeLayout.layoutRoot.select(".inset-viewport");
};

/**
 * Initialize the view
 */
TreeInsetLayout.prototype.init = function () {
  var self = this,
      tree = self.treeLayout;

  // initialize the inset scale and translation
  self.scale = Math.min(
      self.config.radius / tree.width,
      self.config.radius / tree.height,
      0.25
  );
  self.translation = [
    self.config.radius - tree.width / 2 * self.scale,
    self.config.radius / 4 + Math.abs((tree.height * self.scale - self.config.radius * 1.5) / 2)
  ];
  self.content.attr("transform", "translate(" + self.translation + ") scale(" + self.scale + ")");
};

/**
 * Make sure the SVG Defs are in order
 */
TreeInsetLayout.prototype.initDefs = function () {
  var self = this,
      tree = self.treeLayout;

  // Setup the clip-path for the inset view
  tree.layoutRoot.select("#inset-clip-path").select("circle")
      .attr("cx", self.config.radius)
      .attr("cy", self.config.radius)
      .attr("r", self.config.radius - 0);
};

/**
 * Scale and translate
 * @param scale
 * @param translation
 */
TreeInsetLayout.prototype.scaleAndTranslate = function (scale, translation){

};

/**
 * Update the view including all node and link layout
 * @param duration
 */
TreeInsetLayout.prototype.update = function (duration) {
  var self = this,
      tree = self.treeLayout,
      nodeHandler = tree.nodeHandler,
      nodes,
      nodeEnter,
      links;

  // Update the viewport
  self.updateViewport();

  // Create the viewport base node selection
  nodes = self.nodeLayer.selectAll(".node-group")
      .data(nodeHandler.getNodes(), function (d) { return d._id; });

  // Enter any new nodes at the parent's previous position
  nodeEnter = nodeHandler.createGroups(nodes, 'inset_');

  // Create the Root node
  nodeHandler.createRootNodes(nodeEnter);

  // Create the node elements
  nodeHandler.createBacks(nodeEnter);

  // Node update
  nodeHandler.transitionUpdates(nodes, duration);

  // Transition removed nodes
  nodes.exit().remove();

  // Update the links
  links = self.linkLayer.selectAll(".link")
      .data(tree.linkHandler.linkList, function (d) { return d.id; });
  tree.linkHandler.createAndUpdateLinks(links, duration);

};

/**
 * Update the location of the viewport rectangle
 * @param duration
 */
TreeInsetLayout.prototype.updateViewport = function () {
  var self = this,
      tree = self.treeLayout,
      bounds,
      contentRadius,
      windowBounds,
      viewCenter;

  // figure out the bounds
  tree.updateContentBounds();
  bounds = tree.contentBounds;

  // set the inset scaling
  if(bounds !== undefined){
    // figure out the radius of the content bounds to fit the rectangle content into the circle
    contentRadius = Math.sqrt(
        Math.pow((bounds.right - bounds.left) / 2, 2) +
        Math.pow((bounds.bottom - bounds.top) / 2, 2)
    );

    // use a "safety" factor of 90% to add some view margin
    self.scale = self.config.radius / contentRadius * self.config.scaleFactor;

    // figure out the center of the visible content
    viewCenter = {
      x: (bounds.left + bounds.right) / 2,
      y: (bounds.top + bounds.bottom) / 2
    };

    // figure out the scaled bounds of the visible window
    windowBounds = {
      x: tree.translation[0] / tree.scale,
      y: tree.translation[1] / tree.scale,
      width: tree.width / tree.scale,
      height: tree.height / tree.scale
    };

    // calculate the translation to center the content within the circle
    self.translation = [
      self.config.radius - viewCenter.x * self.scale,
      self.config.radius - viewCenter.y * self.scale
    ];

    // translate to the newly calculated values
    self.content
        .transition()
        .duration(500)
        .attr("transform", "translate(" + self.translation + ") scale(" + self.scale + ")");

    // Setup the viewport
    self.viewport
        .attr("x", self.translation[0] - windowBounds.x * self.scale)
        .attr("y", self.translation[1] - windowBounds.y * self.scale)
        .attr("width", windowBounds.width * self.scale)
        .attr("height", windowBounds.height * self.scale);
  }
};