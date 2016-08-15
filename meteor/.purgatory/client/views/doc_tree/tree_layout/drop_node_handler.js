/**
 * Handle all of the accounting for the Drop Nodes
 *
 * @param treeLayout
 * @param config
 * @constructor
 */
TreeDropNodeHandler = function (treeLayout, config) {
  var self = this;

  // Make sure there's a tree layout
  if (!treeLayout) {
    console.error("TreeDropNodeHandler constructor failed: no TreeLayout passed");
    return;
  }
  self.treeLayout = treeLayout;

  // condense the config
  self.config = config || {};
  _.defaults(self.config, DocTreeConfig.dropNodes);

  // get a handle to the layer
  self.layer  = self.treeLayout.layoutRoot.select(".drop-node-layer");

  // start out hidden
  self.hide();
};

/**
 * Hide the drop targets
 */
TreeDropNodeHandler.prototype.hide = function () {
  var self = this;
  self.layer.attr("display", "none");
};

/**
 * Show the drop targets
 */
TreeDropNodeHandler.prototype.show = function () {
  var self = this;
  self.layer.attr("display", "block");
  self.clearNode();
};

/**
 * Get the drop node
 */
TreeDropNodeHandler.prototype.getNode = function () {
  return this.node;
};

/**
 * Clear the drop node
 */
TreeDropNodeHandler.prototype.clearNode = function () {
  delete this.node;
};

/**
 * Create the drop targets
 * @param selection
 */
TreeDropNodeHandler.prototype.createDropTargets = function (selection) {
  var self = this,
    tree = self.treeLayout;

  selection
    .filter(function (d) { return d.type === NodeTypes.page || d.type === NodeTypes.view; })
    .append("g")
    .attr("transform", function(d) { return "translate(-" + Math.round(d.icon.width / 2) + ", -" + Math.round(d.icon.height / 2) + ")"; })
    .append("rect")
    .attr("class", "drop-target")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", function(d) { return d.icon.width; })
    .attr("height", function(d) { return d.icon.height; })
    .attr("rx", tree.nodeHandler.config.cornerRadius)
    .attr("ry", tree.nodeHandler.config.cornerRadius)
    .on("mouseover", function(d){
      console.debug("dropTarget enter: #node_" + d._id);
      // get the real node and add the hover class to it
      tree.layoutRoot.select("#node_" + d._id).classed("node-group-hover", true);

      // make note of this node as the drop target
      self.node = d;
    })
    .on("mouseout", function(d){
      console.debug("dropTarget exit: #node_" + d._id);

      // remove the hover
      tree.layoutRoot.select("#node_" + d._id).classed("node-group-hover", false);

      // make note of this node as the drop target
      delete self.node;
    });
};

/**
 * Update the display of the drop targets
 */
TreeDropNodeHandler.prototype.update = function () {
  var self = this,
    tree = self.treeLayout,
    dropNodeData,
    dropNodes,
    dropNodeEnter;

  // filter the master list of nodes because not everything is a drop target
  dropNodeData = _.filter(tree.nodeHandler.getNodes(), function (d) {
    return d.parent && d.parent.visExpanded && (d.type === NodeTypes.page || d.type === NodeTypes.view);
  });

  // Create the drop layer base node selection
  dropNodes = self.layer.selectAll(".node-group")
    .data(dropNodeData, function (d) { return d._id; });

  // Enter any new nodes at the parent's previous position
  dropNodeEnter = tree.nodeHandler.createGroups(dropNodes);

  // Create the body of the drop targets
  self.createDropTargets(dropNodeEnter);

  // Node update
  tree.nodeHandler.transitionUpdates(dropNodes, 0);

  // update the position
  dropNodes
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  // Remove unused nodes
  dropNodes.exit().remove();
};
