/**
 * Service for determining routes between nodes
 * @type {{routeToStart: Function}}
 */
RobaRouter = {
  /**
   * Get the simplest route to a node as a starting point
   * @param node
   */
  routeFromStart: function (node) {
    return new RobaRoute(node);
  },
  /**
   * Get the route from one node to another
   * @param source
   * @param destination
   */
  nodeToNode: function (source, destination) {
    return new RobaRoute(destination, source);
  }
};

/**
 * Drone Route Class
 * @constructor
 * @param destination The _id of the destination node
 * @param source (Optional) The _id of the source node
 */
RobaRoute = function (destination, source) {
  //Meteor.log.info("RobaRoute: Routing from " + source + " to " + destination);
  this.destination = {
    node: _.isObject(destination) ? destination : Collections.Nodes.findOne(destination)
  };
  if(!this.destination.node){
    Meteor.log.error("RobaRoute Failure: destination node " + destination + " not found");
    throw new Meteor.Error("RobaRoute Failure", "Destination node " + destination + " not found");
  }

  // Find the destination parents
  this.findParents(this.destination);

  if(source){
    this.source = {
      node: _.isObject(source) ? source : Collections.Nodes.findOne(source)
    };
    if(!this.source.node){
      Meteor.log.error("RobaRoute Failure: source node " + source + " not found");
      throw new Meteor.Error("RobaRoute Failure", "Source node " + source + " not found");
    }

    // Find the source parents
    this.findParents(this.source);
  }

  // check that the route is feasible
  this.checkFeasibility();

  // determine the starting point
  if(!this.feasible){
    Meteor.log.error("RobaRoute Failure: route is not feasible");
    throw new Meteor.Error("RobaRoute Failure", "Route is not feasible");
  }

  // Get the route
  this.route();

  return this;
};

/**
 * Find the parents for the destination node
 * @param branch Either the 'destination' or 'source' for this route
 */
RobaRoute.prototype.findParents = function (branch) {
  check(branch.node.parentId, String);

  // get the first parent
  var parent = Collections.Nodes.findOne({
      staticId: branch.node.parentId,
      projectVersionId: branch.node.projectVersionId
    }),
    parentLevel = 1;

  if(!parent){
    Meteor.log.error("RobaRoute Failure: Parent node " + branch.node.parentId + " not found in project version " + branch.node.projectVersionId);
    throw new Meteor.Error("RobaRoute Failure", "Parent node " + branch.node.parentId + " not found in project version " + branch.node.projectVersionId);
  }

  branch.parents = [parent];

  // follow the structure up to the determine the platform and user type
  while(parent.type !== NodeTypes.root && parentLevel++ < 1000){
    parent = Collections.Nodes.findOne({staticId: parent.parentId, projectVersionId: parent.projectVersionId});
    branch.parents.push(parent);
  }

  // scrub the parents for basic info
  _.each(branch.parents, function (parent){
    if(parent.type == NodeTypes.platform){
      branch.platform = parent;
    } else if(parent.type == NodeTypes.userType) {
      branch.userType = parent;
    }
  });

  return this;
};

/**
 * Check that the route is likely to succeed
 */
RobaRoute.prototype.checkFeasibility = function () {
  this.feasible = this.destination.node !== undefined
                && this.destination.userType !== undefined
                && this.destination.platform !== undefined;

  if(this.source && this.feasible){
    this.feasible = this.source.node !== undefined
                  && this.source.userType !== undefined
                  && this.source.platform !== undefined;
  }

  return this;
};

/**
 * Determine the route from start to destination
 */
RobaRoute.prototype.route = function () {
  // get the list of nodes for this project
  var routeMap = {},
    versionId = this.destination.node.projectVersionId,
    nodeList = Collections.Nodes.find({projectVersionId: versionId}, {fields: {staticId: 1, navMenus: 1}}).fetch();

  // get the actions for each node
  _.each(nodeList, function (node) {
    // load the direct actions
    Collections.Actions.find({nodeId: node.staticId, projectVersionId: versionId}, {fields: {routes: 1}}).forEach(function (action) {
      _.each(action.routes, function (route) {
        if(!routeMap[node.staticId]){
          routeMap[node.staticId] = {};
        }

        routeMap[node.staticId][route.nodeId] = 1; // get the weight eventually
      });
    });

    // load the nav actions
    _.each(node.navMenus, function (navMenuId) {
      Collections.Actions.find({nodeId: navMenuId, projectVersionId: versionId}, {fields: {routes: 1}}).forEach(function (action) {
        _.each(action.routes, function (route) {
          if(!routeMap[node.staticId]){
            routeMap[node.staticId] = {};
          }

          routeMap[node.staticId][route.nodeId] = 1; // get the weight eventually
        });
      });
    });
  });

  // Check to see if there is a defined starting step
  var start = this.source ? this.source.node : null;

  // Create a synthetic connection between the platform and the direct starting points
  // if there isn't already a defined starting step
  if(!start){
    var platform = this.destination.platform;

    //Meteor.log.debug("RobaRoute.route, start not found, using destination platform: ", platform.title);
    if(!platform){
      Meteor.log.error("RobaRoute.route, could not create route: destination platform not defined");
      throw new Meteor.Error("RobaRoute Failure", "Could not create route: destination platform not defined");
    }

    if(!routeMap[platform.staticId]){
      routeMap[platform.staticId] = {};
    }

    var platformEntryPoints = Collections.Nodes.find({ parentId: platform.staticId }, {fields: {staticId: 1}}).forEach(function (platformEntry) {
      routeMap[platform.staticId][platformEntry.staticId] = 1; // get the weight eventually
    });

    start = platform;
  }

  // Create the graph
  var graph = new DijkstraGraph(routeMap);

  // get the raw route of nodeIds to string together
  //Meteor.log.info("RobaRoute.route, determining route from " + start.staticId + " to " + this.destination.node.staticId);
  var rawRoute = graph.findShortestPath(start.staticId, this.destination.node.staticId);

  if(!rawRoute){
    Meteor.log.error("RobaRoute.route, could not create route: route not found");
    throw new Meteor.Error("RobaRoute Failure", "Could not create route: route not found");
  }

  //Meteor.log.debug("RobaRoute.route, found route with " + rawRoute.length + " steps");

  // Create the full route with node records and actions
  this.route = [];
  var i, j, pointNodeId, stepNum = 0;
  for(i = 0; i < rawRoute.length; i++){
    pointNodeId = rawRoute[i];
    var step = {
      nodeId: pointNodeId,
      node: Collections.Nodes.findOne({staticId: pointNodeId, projectVersionId: start.projectVersionId})
    };

    // skip the platform step
    if(step.node.type == NodeTypes.platform){
      //Meteor.log.debug("RobaRoute.route, skipping platform node: " + step.node.title);
      continue;
    }

    step.stepNum = stepNum++;

    // pick an action for each step except the last
    if(i < rawRoute.length - 1){
      step.destinationId = rawRoute[i + 1];
      step.destination = Collections.Nodes.findOne({staticId: step.destinationId, projectVersionId: start.projectVersionId});
      step.action = Collections.Actions.findOne({
        nodeId: step.nodeId,
        projectVersionId: start.projectVersionId,
        routes: {
          $elemMatch: {nodeId: step.destinationId}
        }
      });

      // if there isn't a native route, check for nav menu links
      if(!step.action){
        j = 0;
        while(!step.action && j < step.node.navMenus.length){
          step.action = Collections.Actions.findOne({
            nodeId: step.node.navMenus[j],
            projectVersionId: start.projectVersionId,
            routes: {
              $elemMatch: {nodeId: step.destinationId}
            }
          });

          j++;
        }
        if(!step.action){
          Meteor.log.error("RobaRoute.route, could not create route: action could not be found between " + step.nodeId + " and " + step.destinationId);
          throw new Meteor.Error("RobaRoute Failure", "Could not create route: action could not be found between " + step.nodeId + " and " + step.destinationId);
        }
      }
    }

    // store the route step
    this.route.push(step);
  }
};

/**
 * Create a clone of this route ready for storage
 */
RobaRoute.prototype.export = function () {
  return {
    feasible: this.feasible,
    projectId: this.destination.node.projectId,
    projectVersionId: this.destination.node.projectVersionId,
    platform: this.destination.platform,
    userType: this.destination.userType,
    destination: this.destination.node,
    steps: this.route
  }
};