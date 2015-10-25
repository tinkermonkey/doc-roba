/**
 * Handle all of the accounting for the node data structures
 *
 * @param treeLayout
 * @param config
 * @constructor
 */
TreeNodeHandler = function (treeLayout, config) {
  var self = this;

  // Make sure there's a tree layout
  if(!treeLayout){
    console.error("TreeNodeHandler constructor failed: no TreeLayout passed");
    return;
  }
  self.treeLayout = treeLayout;

  // condense the config
  self.config = config || {};
  _.defaults(self.config, DocTreeConfig.nodes);

  // Get a handle to the base node layer
  self.layer = self.treeLayout.layoutRoot.select(".node-layer");
};

/**
 * Initialize the required SVG definition elements
 */
TreeNodeHandler.prototype.initDefs = function () {
  var self = this,
    tree = self.treeLayout;

  // Setup the clip-path for root node content
  tree.defs.select("#root-clip-path")
    .select("circle")
    .attr("cx", self.config.rootRadius)
    .attr("cy", self.config.rootRadius)
    .attr("r", self.config.rootRadius - self.config.borderWidth);

  // Setup the clip-path for node group content
  tree.defs.select("#node-clip-path")
    .select("rect")
    .attr("x", self.config.borderWidth / 2)
    .attr("y", self.config.borderWidth / 2)
    .attr("width", self.config.width - self.config.borderWidth)
    .attr("height", self.config.height - self.config.borderWidth)
    .attr("rx", self.config.cornerRadius - self.config.borderWidth)
    .attr("ry", self.config.cornerRadius - self.config.borderWidth);
};

/**
 * Set the master list of nodes
 * @param nodeList The full flat list of nodes from the DB
 */
TreeNodeHandler.prototype.setNodes = function (nodeList) {
  var self = this;

  self.nodeList = nodeList;
};

/**
 * Get the full list of nodes
 * @returns {*}
 */
TreeNodeHandler.prototype.getNodes = function () {
  return this.nodeList;
};

/**
 * Add a node to a parent, updating is handled by autorun
 * @param parent The parent of the new node
 * @param dir The direction to add the node in (right or down)
 */
TreeNodeHandler.prototype.addNode = function(parent, dir){
  var self = this,
    tree = self.treeLayout;

  // update the node state cache for the parent so that the child is visible
  tree.nodeStateCache[parent._id].logExpanded = true;
  tree.nodeStateCache[parent._id].visExpanded = true;

  var config = {
    parentId: parent.staticId,
    userTypeId: parent.type == NodeTypes.userType ? parent.staticId : parent.userTypeId,
    platformId: parent.type == NodeTypes.platform ? parent.staticId : parent.platformId,
  };
  switch (parent.type){
    case NodeTypes.root:
      config.type = NodeTypes.userType;
      config.title = "New User Type";
      break;
    case NodeTypes.userType:
      config.type = NodeTypes.platform;
      config.title = "New Platform";
      break;
    case NodeTypes.platform:
      if(parent.config && parent.config.type){
        if(parent.config.type == PlatformTypes.email){
          config.type = NodeTypes.email;
          config.title = "New Email";
          break;
        }
      } else {
        config.type = NodeTypes.page;
        config.title = "New Login";
        break;
      }
    default:
      if(dir === "right"){
        config.type = NodeTypes.view;
        config.title = "New View";
      } else if(dir === "nav"){
        config.type = NodeTypes.navMenu;
        config.title = "New Nav Menu";
      } else {
        config.type = NodeTypes.page;
        config.title = "New Page";
      }
  }

  // Add the project info
  config.projectId = parent.projectId;
  config.projectVersionId = parent.projectVersionId;

  // Create the record
  Nodes.insert(config, function (error, nodeId) {
    if(!error && nodeId){
      Meteor.log.debug("Node inserted: " + nodeId);
      tree.nodeStateCache[nodeId] = {
        logExpanded: false,
        visExpanded: false
      };
    } else {
      console.error("Node insert failed: ", error);
    }
  });
};

/**
 * Prepare the list of nodes for an update
 * @param nodeList
 */
TreeNodeHandler.prototype.prepNodes = function(){
  var self = this,
    tree = self.treeLayout;

  // start by explicitly indexing the nodes and sizing them
  _.each(self.nodeList, function (node) {
    self.calcNodeSize(node);

    if(node.visExpanded === undefined){
      node.visExpanded = false;
    }

    if(node.logExpanded === undefined){
      if(node.type === NodeTypes.root || node.type === NodeTypes.userType){
        node.logExpanded = true;
      } else {
        node.logExpanded = false;
      }
    }
  });

  // map all of the node relations and clean up the links
  _.each(self.nodeList, function (node) {
    self.mapNode(node);
  });

  // position the nodes
  self.positionNodes();
};

/**
 * Map the flat list of nodes into a hierarchy
 * @param d The node to map children to
 * @param nodeList The list of nodes to scan for links
 */
TreeNodeHandler.prototype.mapNode = function(d){
  //Meteor.log.debug("mapping node: " + d._id + " (" + d.title + ")");
  var self = this,
    tree = self.treeLayout;

  d.childPages = []; // list of children indices
  d.childViews = []; // list of children indices

  // find all of the children nodes
  _.each(self.nodeList, function (node) {
    // only nodes for which the parent is unknown
    if(node.parentId && node.parentId === d.staticId){
      // map the relation
      node.parent = d;

      // pages and views are linked separately
      if(node.type === NodeTypes.view || node.type === NodeTypes.navMenu){
        //node.childIndex = d.childViews.length; // the index of this node in the parent's child list
        d.childViews.push(node);
      } else {
        //node.childIndex = d.childPages.length; // the index of this node in the parent's child list
        d.childPages.push(node);
      }

      // create the link
      tree.linkHandler.addLink( d._id + "_" + node._id, d, node );
    }
  });

  // sort the childViews by type and title
  //_.each(d.childViews, function (node, i) { console.log("Pre-sort: ", node.type.toString() + node.title) });
  d.childViews.sort(function (a, b) {
    if(a.type > b.type){
      return -1;
    } else if(a.type < b.type){
      return 1;
    } else {
      if(a.title > b.title){
        return 1;
      } else if(b.title > a.title){
        return -1;
      }
    }
    return 0
  });
  //_.each(d.childViews, function (node, i) { console.log("Post-sort: ", node.type.toString() + node.title) });

  // sort the childPages by title
  d.childPages.sort(function (a, b) {
    if(a.title > b.title){
      return 1;
    } else if(b.title > a.title){
      return -1;
    }
    return 0
  });

  // set the child indices
  _.each(d.childViews, function (node, i) { node.childIndex = i });
  _.each(d.childPages, function (node, i) { node.childIndex = i });
};

/**
 * Position all of the nodes using a two-stage algorithm
 */
TreeNodeHandler.prototype.positionNodes = function () {
  var self = this,
    tree = self.treeLayout,
    maxDepth,
    depth;

  // initialize the root node
  _.each(self.getRootNodes(), function (rootNode){
    rootNode.depth = 0;
    rootNode.x = tree.width / 2;
    rootNode.y = 0;
    treeUtils.setNodeDepth(rootNode, 0);

    // From the bottom of the tree up, calculate the family local position
    maxDepth = treeUtils.getMaxDepth(self.nodeList);
    for (depth = maxDepth; depth > 0; depth--) {
      _.each(treeUtils.getAtDepth(self.nodeList, depth), self.positionLocal.bind(self));
    }

    // Calculate the family local position of the first level
    self.positionLocal(rootNode);

    // from the top down, position the nodes globally
    self.positionGlobal(rootNode);
  });
};

/**
 * Position a node using the bottom-up algorithm
 * @param d
 */
TreeNodeHandler.prototype.positionLocal = function (d) {
  var self = this,
    children = [].concat(d.childPages, d.childViews),
    adjustment,
    lastChild;

  // Create a construct to store relative positioning
  d.family = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    pages: {
      width: 0,
      height: 0
    },
    views: {
      width: 0,
      height: 0
    }
  };

  // If the parent is not visibly expanded, short circuit the whole process
  if(!d.visExpanded){
    d.family.height = d.bounds.height;
    d.family.width  = d.bounds.width;
    d.family.left   = d.bounds.left;
    d.family.right  = d.bounds.right;
    d.family.top    = d.bounds.top;
    d.family.bottom = d.bounds.bottom;
    return;
  }

  // Position the pages loosely
  x = 0;
  _.each(d.childPages, function (page, index) {
    // set the basic x value for the child
    page.family.x = x + Math.abs(page.family.left);

    // keep track of the relative x
    x += Math.abs(page.family.left) + page.family.right + self.config.xMargin;

    // keep track of the largest page height
    if(page.family.height > d.family.pages.height){
      d.family.pages.height = page.family.height;
    }
  });

  // Add in the margin to the width
  if(d.childPages.length){
    lastChild = d.childPages[d.childPages.length -1];
    d.family.pages.width = lastChild.family.x + lastChild.family.right - (d.childPages[0].family.x + d.childPages[0].family.left);
  }

  // Position the views loosely
  y = 0;
  _.each(d.childViews, function (view, index) {
    // set the basic y value for the child
    view.family.y = y + Math.abs(view.family.top);

    // track the relative y
    y += Math.abs(view.family.top) + view.family.bottom + self.config.yViewMargin;

    // keep track of the largest height
    if(view.family.width > d.family.views.width){
      d.family.views.width = view.family.width;
    }
  });

  // Add in the margin to the height
  if(d.childViews.length){
    lastChild = d.childViews[d.childViews.length -1];
    d.family.views.height = lastChild.family.y + lastChild.family.bottom - (d.childViews[0].family.y + d.childViews[0].family.top);
  }

  // Adjust the x position of the pages to center them
  adjustment = d.family.pages.width / 2;
  _.each(d.childPages, function (page) {
    page.family.x -= adjustment;
  });

  // Adjust the x position of the pages to center them
  adjustment = d.family.views.height / 2;
  _.each(d.childViews, function (view) {
    view.family.y -= adjustment;
  });

  // Set the y value for the pages
  adjustment = Math.max(d.family.views.height / 2, d.bounds.bottom) + this.config.yMargin;
  _.each(d.childPages, function (page) {
    if(page.family.views.height){
      page.family.y = adjustment + page.family.views.height / 2;
    } else {
      page.family.y = adjustment + Math.abs(page.bounds.top);
    }
  });

  // Set the x value for all of the views
  adjustment = Math.max(d.family.pages.width / 2 + this.config.xMargin, d.bounds.right + this.config.xViewMargin);
  _.each(d.childViews, function (view) {
    if(view.family.pages.width){
      view.family.x = adjustment + view.family.pages.width / 2;
    } else {
      view.family.x = adjustment + Math.abs(view.bounds.left);
    }
  });

  // Find the edges of the family
  d.family.left   = d.bounds.left;
  d.family.right  = d.bounds.right;
  d.family.top    = d.bounds.top;
  d.family.bottom = d.bounds.bottom;
  _.each(children, function(child){
    // left
    if(child.family.x + child.family.left < d.family.left){
      d.family.left = child.family.x + child.family.left;
    }
    // right
    if(child.family.x + child.family.right > d.family.right){
      d.family.right = child.family.x + child.family.right;
    }
    // top
    if(child.family.y + child.family.top < d.family.top){
      d.family.top = child.family.y + child.family.top;
    }
    // bottom
    if(child.family.y + child.family.bottom > d.family.bottom){
      d.family.bottom = child.family.y + child.family.bottom;
    }
  });

  // set the overall height and width including the node bounds
  d.family.height = d.family.bottom - d.family.top;
  d.family.width  = d.family.right - d.family.left;
};

/**
 * Position a node's children globally based on the node positioning
 * @param d
 */
TreeNodeHandler.prototype.positionGlobal = function (d) {
  var self = this,
    children = [].concat(d.childPages, d.childViews);

  // position all of the children
  _.each(children, function(child){
    if(d.visExpanded){
      child.x = d.x + child.family.x;
      child.y = d.y + child.family.y;
    } else {
      child.x = d.x;
      child.y = d.y;
    }

    // position the child's children
    self.positionGlobal(child);
  });
};

/**
 * Calculate the height and width of a node
 * The node has two sizes, the icon size and the overall size (including
 * things like overlays and such)
 * @param d The node to size
 */
TreeNodeHandler.prototype.calcNodeSize = function(d){
  var iconHeight  = this.config.height,
    iconWidth   = this.config.width;

  // get a size based on the type of node
  if(d.type == NodeTypes.root){
    iconHeight = 2 * this.config.rootRadius;
    iconWidth  = 2 * this.config.rootRadius;
  }

  // construct the bounds of the icon, default to the icon centered
  d.icon = {
    top: -1 * iconHeight / 2,
    bottom: iconHeight / 2,
    left: -1 * iconWidth / 2,
    right: iconWidth / 2,
    width: iconWidth,
    height: iconHeight
  };

  // clone this for the bounds of the overall node
  d.bounds = _.clone(d.icon);
};

/**
 * Get the list of root nodes for a node set
 * @returns {Array} The list of root nodes found
 */
TreeNodeHandler.prototype.getRootNodes = function(){
  return _.filter(this.nodeList, function (node) { return node.type === NodeTypes.root });
};

/**
 * Fetch a node by the node _id
 * @param id
 */
TreeNodeHandler.prototype.getNode = function(id){
  return _.find(this.nodeList, function (node) { return node._id === id });
};

/**
 * Fetch a node by the node staticId
 * @param staticId
 */
TreeNodeHandler.prototype.getByStaticId = function(staticId){
  return _.find(this.nodeList, function (node) { return node.staticId === staticId });
};

/**
 * Get a list of descendant nodes for a given node, optionally filtered
 * @param parentNode The node to get the descendants of
 * @param filter A filter function to limit the results with
 * @returns {Array}
 */
TreeNodeHandler.prototype.getDescendants = function(parentNode, filter){
  var self = this,
    nodeList = [],
    searchList = [].concat(parentNode.childPages, parentNode.childViews);

  _.each(searchList, function (node) {
    if(filter){
      if(filter(node)){
        nodeList.push(node);
      }
    } else {
      nodeList.push(node);
    }
    nodeList = nodeList.concat(self.getDescendants(node, filter));
  });

  return nodeList;
};

/**
 * Update the display of all of the nodes
 */
TreeNodeHandler.prototype.update = function (duration) {
  var self = this,
    tree = self.treeLayout,
    nodes,
    nodeEnter;

  // Get the master node selection
  nodes = self.layer.selectAll(".node-group")
    .data(self.nodeList, function (d) { return d._id });

  // Get the root node selection and append a group anywhere needed
  nodeEnter = self.createGroups(nodes);

  // Create the node body for non-root nodes
  self.createRootNodes(nodeEnter);

  // Create the base element of the nodes
  self.createBacks(nodeEnter);

  // Add the event listeners
  self.addEventListeners(nodeEnter);

  // add text to the node
  self.createContent(nodeEnter);

  // Update the nodes
  self.transitionUpdates(nodes, duration);

  // Transition removed nodes
  nodes.exit().transition()
    .duration(duration)
    .attr("transform", function(d) { return d.parent ? "translate(" + d.parent.x + "," + d.parent.y + ")" : "" })
    .remove();
};

/**
 * Create the root nodes for a selection
 * @param selection
 */
TreeNodeHandler.prototype.createRootNodes = function (selection) {
  var self = this,
    tree = self.treeLayout;

  selection
    .filter(function(d){ return d.type === NodeTypes.root })
    .append("g")
    .attr("transform", function(d) { return "translate(-" + Math.round(d.bounds.width / 2) + ", -" + Math.round(d.bounds.height / 2) + ")" })
    .append("circle")
    .attr("class", "node node-root")
    .attr("cx", function (d) { return Math.round(d.icon.width / 2) })
    .attr("cy", function (d) { return Math.round(d.icon.width / 2) })
    .attr("r", function (d) { return d.icon.height / 2 })
    .on("click", tree.nodeClickFilter.bind(tree))
    .on("dblclick", tree.nodeClickFilter.bind(tree));

  selection.filter(function (d) { return d.type === NodeTypes.root })
    .select("g")
    .append("g")
    .attr("class", "node-content")
    .attr("clip-path", "url(#rootClipPath)");
  /*
   .append("image")
   .attr("x", 0)
   .attr("y", 0)
   .attr("width", function(d){ return d.icon.width } )
   .attr("height", function(d){ return d.icon.height } )
   .attr("xlink:href", "http://frakturmedia.net/wp-content/uploads/2013/06/Paths.png");
   */
};

/**
 * Create the base group for nodes
 * @param selection
 */
TreeNodeHandler.prototype.createGroups = function (selection, prefix) {
  prefix = prefix === undefined ?  "" : prefix;
  return selection.enter()
    .append("g")
    .attr("class", "node-group")
    .attr("id", function(d){ return prefix + "node_" + d._id })
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")" });
};

/**
 * Create the base shape for the node icon
 * @param selection
 */
TreeNodeHandler.prototype.createBacks = function (selection) {
  var self = this;

  selection
    .filter(function (d) { return d.type !== NodeTypes.root })
    .append("g")
    .attr("transform", function(d) { return "translate(" + d.icon.left + ", " + d.icon.top+ ")" })
    .append("rect")
    .attr("class", function(d){ return "node node-" + NodeTypesLookup[d.type] })
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", function(d) { return d.icon.width })
    .attr("height", function(d) { return d.icon.height })
    .attr("rx", self.config.cornerRadius)
    .attr("ry", self.config.cornerRadius);
};

/**
 * Create the node content elements
 * @param selection
 */
TreeNodeHandler.prototype.createContent = function (selection) {
  var self = this,
    nodeContent;

  nodeContent = selection
    .filter(function(d){ return d.type !== NodeTypes.root })
    .select("g")
    .append("g")
    .attr("class", "node-content")
    .attr("clip-path", "url(#node-clip-path)");

  nodeContent.append("rect")
    .attr("class", "title-backround")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", function(d){ return d.icon.width } )
    .attr("height", self.config.headerHeight );

  nodeContent.append("text")
    .attr("class", "node-title no-select-complete")
    .attr("x", 4)
    .attr("y", self.config.titleHeight + self.config.borderWidth)
    .text(function(d){ return d.title });
};

/**
 * Setup the update transitions for a selection of nodes
 * @param selection
 * @param duration
 */
TreeNodeHandler.prototype.transitionUpdates = function (selection, duration) {
  // update the text
  selection
    .select(".node-title")
    .text(function(d){ return d.title });

  // update the position
  selection
    .attr("visibility", "visible")
    .transition()
    .duration(duration)
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")" })
    .attr("opacity", function(d){ return d.parent ? d.parent.visExpanded ? 1 : 0 : 1 })
    .transition()
    .attr("visibility", function(d){ return d.parent ? d.parent.visExpanded ? "visible" : "hidden" : "visible" });
};

/**
 * Add event listeners to the nodes
 * @param selection
 */
TreeNodeHandler.prototype.addEventListeners = function (selection) {
  var self = this,
    tree = self.treeLayout;

  selection
    .on("click", tree.nodeClickFilter.bind(tree) )
    .on("dblclick", tree.nodeClickFilter.bind(tree) )
    .on("mouseenter", tree.nodeMouseEnterHandler.bind(tree) )
    .on("mouseleave", tree.nodeMouseLeaveHandler.bind(tree) );
};

/**
 * Edit a node
 * @param d
 */
TreeNodeHandler.prototype.editNode = function (node) {
  var self = this,
    tree = self.treeLayout;

  var drawerHeight = tree.config.bottomDrawerHeight;
  if(drawerHeight.match(/\%/)){
    drawerHeight = parseFloat(drawerHeight) / 100 * tree.height;
    console.log("drawerHeight: ", drawerHeight);
  }

  // Zoom to focus on the node
  tree.zoomAndCenterNodes([node], { bottom: drawerHeight + tree.config.yMargin });

  // show the bottom drawer
  BottomDrawer.show({
    height: drawerHeight,
    contentTemplate: "edit_node",
    contentData: {_id: node._id},
    callback: function () {
      this.treeLayout.nodeControls.unlock();
      this.treeLayout.nodeControls.hide();
      this.treeLayout.restoreCachedView(this.treeLayout.config.stepDuration);
    }.bind(self)
  });

  // lock the node controls
  tree.nodeControls.lock();
};
