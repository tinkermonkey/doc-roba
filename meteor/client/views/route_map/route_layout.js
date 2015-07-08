/**
 * Custom tree layout for providing navigational guidance
 */
RouteLayout = function (elementId, context, config) {
  var self = this;

  // store the container element
  self.container = $("#" + elementId);

  // store the project context
  self.context = context;

  // set the default config
  self.config = config || {};
  _.defaults(self.config, DocTreeConfig.tree);

  // set the container bounds
  self.layoutRoot  = d3.select("#" + elementId);
  self.globalLayer = self.layoutRoot.select(".global-layer");

  // create the handlers
  self.nodeHandler   = new TreeNodeHandler(self, self.config.nodes);
  self.actionHandler = new TreeActionHandler(self, self.config.actions);
};

/**
 * Initialize the route layout
 */
RouteLayout.prototype.init = function () {
  var self = this;
  self.globalLayer.attr("transform", "translate(0," + ( 0 - (self.nodeHandler.config.height / 2)) + ")" );
};

/**
 * Set the route to display
 * @param route
 */
RouteLayout.prototype.setRoute = function (route) {
  this.route = route;
};

/**
 * Scrub all of the source data and update all of the links
 */
RouteLayout.prototype.prepData = function () {
  var self = this,
    nodes = [], actionRoutes = [];

  // pull the nodes and actions out of the route
  console.log("prepData: ", self.route);
  _.each(self.route.route, function (step, i) {
    var node = step.node;

    // setup the node
    node.childPages = []; // list of children indices
    node.childViews = []; // list of children indices

    // add this to the previous node in the route
    if(i > 0){
      var parentNode = self.route.route[i-1].node;
      node.parent = parentNode;
      parentNode.childPages.push(node);
    } else {
      node.parent = {
        visExpanded: true
      }
    }

    // position the node
    node.x = (self.nodeHandler.config.width + self.nodeHandler.config.xMargin) / 2;
    node.y = i * (self.nodeHandler.config.height + self.nodeHandler.config.yMargin);

    // prep the node state
    self.nodeHandler.calcNodeSize(node);
    node.visExpanded = true;
    node.logExpanded = true;

    nodes.push(node);
  });

  // store the nodes in the node handler
  self.nodeHandler.setNodes(nodes);

  // process the actions
  _.each(self.route.route, function (step, i) {
    if(step.action){
      var nextNode = self.route.route[i+1].node,
        actionRoute = {
          _id: step.action._id,
          action: step.action,
          source: self.nodeHandler.getByStaticId(step.node.staticId),
          destination: self.nodeHandler.getByStaticId(nextNode.staticId),
          nav: false,
          index: 0,
          routeIndex: 0,
          routeOrder: 0,
          routeSortIndex: 0,
          actionSortIndex: 0,
          actionCount: 1,
          count: 1
        };

      actionRoutes.push(actionRoute);
    }
  });

  // Set the actionRoutes directly because we bypassed the normal data prep
  self.actionHandler.actionRoutes = actionRoutes;
  self.actionHandler.visibleActionList = [];
  _.each(actionRoutes, function (route) {
    self.actionHandler.visibleActionList.push(route._id);
  });
};

/**
 * Resize the container to fit the content
 */
RouteLayout.prototype.updateSize = function () {
  var self = this,
    stepCount = self.route.route.length,
    viewParams;

  // Measure the new dimensions
  var width = self.nodeHandler.config.width + self.nodeHandler.config.xMargin,
    height = (stepCount - 2) * self.nodeHandler.config.height + (stepCount - 1) * self.nodeHandler.config.yMargin;

  // update the container
  self.container.width(width);
  self.container.height(height);
};

/**
 * Respond to a resize event
 */
RouteLayout.prototype.resize = function () {
  var self = this;

  // Update the display
  self.update();

  // Measure the new dimensions
  self.updateSize();
};

/**
 * Update the tree layout
 * @param duration The duration of the update transition
 */
RouteLayout.prototype.update = function (duration) {
  var self = this;

  // default duration
  duration = duration || self.config.stepDuration;

  // prepare the data for the update
  self.prepData();

  // Update the nodes
  self.nodeHandler.update(duration);

  // Update the actions
  self.actionHandler.update(duration);
};

/**
 * Dummy event handlers
 */
RouteLayout.prototype.nodeClickFilter = function () {};
RouteLayout.prototype.nodeMouseEnterHandler = function () {};
RouteLayout.prototype.nodeMouseLeaveHandler = function () {};
RouteLayout.prototype.actionClickHandler = function () {};
RouteLayout.prototype.actionMouseEnterHandler = function () {};
RouteLayout.prototype.actionMouseLeaveHandler = function () {};