import { Meteor } from 'meteor/meteor';
import { Nodes } from '../nodes/nodes.js';
import { Actions } from '../actions/actions.js';
import { NodeTypes } from '../nodes/node_types.js';
import { DijkstraGraph } from './dijkstra/graph.js';

let debug = true;

/**
 * A route through the nodes
 */
export default class RobaRoute {
  /**
   * RobaRoute
   * @param destination
   * @param source
   * @return {RobaRoute}
   * @constructor
   */
  constructor (destination, source) {
    let self         = this;
    self.steps       = [];
    self.projectMap  = {};
    self.actionMap   = {};
    self.destination = {
      node: _.isObject(destination) ? destination : Nodes.findOne({ $or: [ { _id: destination }, { staticId: destination } ] })
    };
    
    // Make sure the destination was able to be identified
    if (!self.destination.node) {
      console.error("RobaRoute Failure: destination node " + destination + " not found");
      throw new Meteor.Error("RobaRoute Failure", "Destination node " + destination + " not found");
    }
    
    // Find the destination parents
    self.destination.platform = self.destination.node.platform();
    self.destination.userType = self.destination.node.userType();
    
    if (source) {
      self.source = {
        node: _.isObject(source) ? source : Nodes.findOne({ $or: [ { _id: source }, { staticId: source } ] })
      };
      if (!self.source.node) {
        console.error("RobaRoute Failure: source node " + source + " not found");
        throw new Meteor.Error("RobaRoute Failure", "Source node " + source + " not found");
      }
      
      // Find the source parents
      //this.findParents(this.source);
      self.source.platform = self.source.node.platform();
      self.source.userType = self.source.node.userType();
    }
    
    // check that the route is feasible
    self.checkFeasibility();
    
    // determine the starting point
    if (!self.feasible) {
      console.error("RobaRoute Failure: route is not feasible");
      throw new Meteor.Error("RobaRoute Failure", "Route is not feasible");
    }
    
    // Get the route
    self.createRoute();
    
    return self;
  }
  
  /**
   * Check that the route is likely to succeed
   */
  checkFeasibility () {
    debug && console.log('RobaRoute.checkFeasibility');
    this.feasible = this.destination.node !== undefined
        && this.destination.userType !== undefined
        && this.destination.platform !== undefined;
    
    if (this.source && this.feasible) {
      this.feasible = this.source.node !== undefined
          && this.source.userType !== undefined
          && this.source.platform !== undefined;
    }
    
    return this;
  }
  
  /**
   * Determine the route from start to destination
   */
  createRoute () {
    debug && console.log('RobaRoute.createRoute');
    let self = this,
        graph, rawRoute, nodeRoute;
    
    // Get the project map
    self.getProjectMap();
    
    // Figure out the starting point
    self.getStartingPoint();
    
    // Create the graph
    graph = new DijkstraGraph(self.projectMap);
    
    // get the raw route of nodeIds to string together
    console.info("RobaRoute.route, determining route from " + self.startingNode.staticId + " to " + self.destination.node.staticId);
    rawRoute = graph.findShortestPath(self.startingNode.staticId, self.destination.node.staticId);
    
    if (!rawRoute) {
      console.error("RobaRoute.route, could not create route: route not found");
      throw new Meteor.Error("RobaRoute Failure", "Could not create route: route not found");
    }
    
    // Filter the non-navigable node (platforms) from the route
    nodeRoute = rawRoute
        .map((nodeId) => {
          return Nodes.findOne({ staticId: nodeId, projectVersionId: self.startingNode.projectVersionId })
        })
        .filter((node) => {
          return node.type === NodeTypes.page || node.type === NodeTypes.view
        });
    
    // Create the full route with node records and actions
    debug && console.debug("RobaRoute.route, found route with " + nodeRoute.length + " steps");
    nodeRoute.forEach((node, i) => {
          let step = {
            nodeId : node.staticId,
            node   : node,
            stepNum: i
          };
          
          if (i > 0) {
            debug && console.debug('Getting action for step', i);
            step.sourceNode  = nodeRoute[ i - 1 ];

            // The action should be in the action map
            debug && console.debug('Checking action map for a route from', step.sourceNode.staticId, 'to', step.nodeId, self.actionMap[ step.sourceNode.staticId ]);
            //console.log('ActionMap: ', self.actionMap);
            let actionMapEntry = self.actionMap[ step.sourceNode.staticId ][ step.nodeId ];
            
            if (!actionMapEntry) {
              console.error("RobaRoute.route, could not create route: action could not be found between " + step.sourceNode.staticId + " and " + step.nodeId);
              throw new Meteor.Error("RobaRoute Failure", "Could not create route: action could not be found between " + step.sourceNode.title + " and " + step.node.title);
            }
            debug && console.debug('Action to get from', step.sourceNode.title, 'to', step.node.title, 'is', actionMapEntry.actionId, 'route', actionMapEntry.routeIndex);
            step.actionId = actionMapEntry.actionId;
            step.action = Actions.findOne({ staticId: actionMapEntry.actionId, projectVersionId: self.startingNode.projectVersionId });
            
            // Not sure how this could happen, best to be safe
            if (!step.action) {
              console.error("RobaRoute.route, could not create route: action could not be found:", actionMapEntry, step);
              throw new Meteor.Error("RobaRoute Failure", "Could not create route: action could not be found " + actionMapEntry.actionId);
            }
          }
          
          self.steps.push(step);
        }
    );
  }
  
  /**
   * Get the map of all nodes and actions for this project
   */
  getProjectMap () {
    let self      = this,
        versionId = self.destination.node.projectVersionId,
        nodeList  = Nodes.find({ projectVersionId: versionId }, { fields: { staticId: 1, navMenus: 1 } });
    
    // Go through each node and map in the actions (both direct and via navMenu nodes)
    debug && console.log('RobaRoute.getProjectMap mapping', nodeList.count(), 'nodes');
    nodeList.forEach((sourceNode) => {
      // Get all of the actions for this node
      Actions.find({ nodeId: sourceNode.staticId, projectVersionId: versionId }, { fields: { staticId: 1, routes: 1 } })
          .forEach((action, i) => {
            //debug && console.log('RobaRoute.getProjectMap mapping action', i, 'for node', sourceNode.staticId);
            self.mapActionRoutes(sourceNode, action);
          });
      
      // Map all of the actions available via nav menus on this node
      sourceNode.navMenus && sourceNode.navMenus.forEach((navMenuId) => {
        Actions.find({ nodeId: navMenuId, projectVersionId: versionId }, { fields: { staticId: 1, routes: 1 } })
            .forEach((action, i) => {
              //debug && console.log('RobaRoute.getProjectMap mapping navMenu action', i, 'for node', sourceNode.staticId);
              self.mapActionRoutes(sourceNode, action);
            });
      });
    });
  }
  
  /**
   * Map all of the routes for an action
   * @param sourceNode
   * @param action
   */
  mapActionRoutes (sourceNode, action) {
    //debug && console.log('RobaRoute.mapActionRoutes');
    let self = this;
    
    // Map in all of the route for this action
    action.routes && action.routes.forEach((route, routeIndex) => {
      let routeWeight = self.getRouteWeight(action, routeIndex);
      
      // Create the node in the map if it doesn't exist
      if (!self.projectMap[ sourceNode.staticId ]) {
        self.projectMap[ sourceNode.staticId ] = {};
        self.actionMap[ sourceNode.staticId ]  = {};
      }
      
      // Create the link between the two nodes with proper weighting
      if (self.projectMap[ sourceNode.staticId ][ route.nodeId ] !== undefined) {
        let existingRouteWeight = self.projectMap[ sourceNode.staticId ][ route.nodeId ];
        
        // If there's an existing route between the nodes, only keep the lowest weight one
        self.projectMap[ sourceNode.staticId ][ route.nodeId ] = Math.min(routeWeight, existingRouteWeight);
        if (routeWeight < existingRouteWeight) {
          self.actionMap[ sourceNode.staticId ][ route.nodeId ] = {
            actionId  : action.staticId,
            routeIndex: routeIndex
          };
        }
      } else {
        self.projectMap[ sourceNode.staticId ][ route.nodeId ] = routeWeight;
        self.actionMap[ sourceNode.staticId ][ route.nodeId ]  = {
          actionId  : action.staticId,
          routeIndex: routeIndex
        };
      }
    });
  }
  
  /**
   * Get the weight for a route
   * @return {number}
   */
  getRouteWeight (action, routeIndex) {
    let self = this;
    return 1;
  }
  
  /**
   * Get the route starting point
   */
  getStartingPoint () {
    let self          = this;
    self.startingNode = self.source ? self.source.node : null;
    
    // If the starting node isn't defined, create a synthetic connection between the platform entry points
    // and the platform in order to make sure the route starts at a valid entry point
    if (!self.startingNode) {
      let platform = self.destination.platform;
      
      console.debug("RobaRoute.route, start not found, using destination platform: ", platform.title);
      if (!platform) {
        console.error("RobaRoute.route, could not create route: destination platform not defined");
        throw new Meteor.Error("RobaRoute Failure", "Could not create route: destination platform not defined");
      }
      
      // Create an element on the project map for the platform itself if there isn't already one
      if (!self.projectMap[ platform.staticId ]) {
        self.projectMap[ platform.staticId ] = {};
      }
      
      // Add the connections between the platform and the entry points
      platform.platformEntryPoints().forEach((platformEntry) => {
        // The weight of the connection has no meaning here
        self.projectMap[ platform.staticId ][ platformEntry.staticId ] = 1;
      });
      
      self.startingNode = platform;
    }
    
  }
  
  /**
   * Create a clone of this route ready for storage
   */
  getManifest () {
    return {
      feasible        : this.feasible,
      projectId       : this.destination.node.projectId,
      projectVersionId: this.destination.node.projectVersionId,
      platform        : this.destination.platform,
      userType        : this.destination.userType,
      destination     : this.destination.node,
      steps           : this.steps
    }
  }
}
