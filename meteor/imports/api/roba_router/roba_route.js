import { Meteor } from "meteor/meteor";
import { Nodes } from "../nodes/nodes.js";
import { Actions } from "../action/action.js";
import { NodeTypes } from "../nodes/node_types.js";
import { DijkstraGraph } from "./dijkstra/graph.js";

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
    let route = this;
  
    //console.info("RobaRoute: Routing from " + source + " to " + destination);
    route.destination = {
      node: _.isObject(destination) ? destination : Nodes.findOne({$or: [{_id: destination}, {staticId: destination}]})
    };
    if (!route.destination.node) {
      console.error("RobaRoute Failure: destination node " + destination + " not found");
      throw new Meteor.Error("RobaRoute Failure", "Destination node " + destination + " not found");
    }
  
    // Find the destination parents
    route.destination.platform = route.destination.node.platform();
    route.destination.userType = route.destination.node.userType();
  
    if (source) {
      route.source = {
        node: _.isObject(source) ? source : Nodes.findOne({$or: [{_id: source}, {staticId: source}]})
      };
      if (!route.source.node) {
        console.error("RobaRoute Failure: source node " + source + " not found");
        throw new Meteor.Error("RobaRoute Failure", "Source node " + source + " not found");
      }
    
      // Find the source parents
      //this.findParents(this.source);
      route.source.platform = route.source.node.platform();
      route.source.userType = route.source.node.userType();
    }
  
    // check that the route is feasible
    route.checkFeasibility();
  
    // determine the starting point
    if (!route.feasible) {
      console.error("RobaRoute Failure: route is not feasible");
      throw new Meteor.Error("RobaRoute Failure", "Route is not feasible");
    }
  
    // Get the route
    route.route();
  
    return route;
  }
  
  /**
   * Check that the route is likely to succeed
   */
  checkFeasibility () {
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
  route () {
    // get the list of nodes for this project
    var routeMap  = {},
        versionId = this.destination.node.projectVersionId,
        nodeList  = Nodes.find({ projectVersionId: versionId }, { fields: { staticId: 1, navMenus: 1 } }).fetch();
    
    // get the actions for each node
    _.each(nodeList, function (node) {
      // load the direct actions
      Actions.find({ nodeId: node.staticId, projectVersionId: versionId }, { fields: { routes: 1 } })
          .forEach(function (action) {
            _.each(action.routes, function (route) {
              if (!routeMap[ node.staticId ]) {
                routeMap[ node.staticId ] = {};
              }
              
              routeMap[ node.staticId ][ route.nodeId ] = 1; // get the weight eventually
            });
          });
      
      // load the nav actions
      _.each(node.navMenus, function (navMenuId) {
        Actions.find({ nodeId: navMenuId, projectVersionId: versionId }, { fields: { routes: 1 } })
            .forEach(function (action) {
              _.each(action.routes, function (route) {
                if (!routeMap[ node.staticId ]) {
                  routeMap[ node.staticId ] = {};
                }
                
                routeMap[ node.staticId ][ route.nodeId ] = 1; // get the weight eventually
              });
            });
      });
    });
    
    // Check to see if there is a defined starting step
    var start = this.source ? this.source.node : null;
    
    // Create a synthetic connection between the platform and the direct starting points
    // if there isn't already a defined starting step
    if (!start) {
      var platform = this.destination.platform;
      
      console.debug("RobaRoute.route, start not found, using destination platform: ", platform.title);
      if (!platform) {
        console.error("RobaRoute.route, could not create route: destination platform not defined");
        throw new Meteor.Error("RobaRoute Failure", "Could not create route: destination platform not defined");
      }
      
      if (!routeMap[ platform.staticId ]) {
        routeMap[ platform.staticId ] = {};
      }
      
      var platformEntryPoints = platform.platformEntryPoints().forEach(function (platformEntry) {
        routeMap[ platform.staticId ][ platformEntry.staticId ] = 1; // get the weight eventually
      });
      
      start = platform;
    }
    
    // Create the graph
    var graph = new DijkstraGraph(routeMap);
    
    // get the raw route of nodeIds to string together
    //console.info("RobaRoute.route, determining route from " + start.staticId + " to " + this.destination.node.staticId);
    var rawRoute = graph.findShortestPath(start.staticId, this.destination.node.staticId);
    
    if (!rawRoute) {
      console.error("RobaRoute.route, could not create route: route not found");
      throw new Meteor.Error("RobaRoute Failure", "Could not create route: route not found");
    }
    
    //console.debug("RobaRoute.route, found route with " + rawRoute.length + " steps");
    
    // Create the full route with node records and actions
    this.route                     = [];
    var i, j, pointNodeId, stepNum = 0;
    for (i = 0; i < rawRoute.length; i++) {
      pointNodeId = rawRoute[ i ];
      var step    = {
        nodeId: pointNodeId,
        node  : Nodes.findOne({ staticId: pointNodeId, projectVersionId: start.projectVersionId })
      };
      
      // skip the platform step
      if (step.node.type == NodeTypes.platform) {
        //console.debug("RobaRoute.route, skipping platform node: " + step.node.title);
        continue;
      }
      
      step.stepNum = stepNum++;
      
      // pick an action for each step except the last
      if (i < rawRoute.length - 1) {
        step.destinationId = rawRoute[ i + 1 ];
        step.destination   = Nodes.findOne({ staticId: step.destinationId, projectVersionId: start.projectVersionId });
        step.action        = Actions.findOne({
          nodeId          : step.nodeId,
          projectVersionId: start.projectVersionId,
          routes          : {
            $elemMatch: { nodeId: step.destinationId }
          }
        });
        
        // if there isn't a native route, check for nav menu links
        if (!step.action) {
          j = 0;
          while (!step.action && j < step.node.navMenus.length) {
            step.action = Actions.findOne({
              nodeId          : step.node.navMenus[ j ],
              projectVersionId: start.projectVersionId,
              routes          : {
                $elemMatch: { nodeId: step.destinationId }
              }
            });
            
            j++;
          }
          if (!step.action) {
            console.error("RobaRoute.route, could not create route: action could not be found between " + step.nodeId + " and " + step.destinationId);
            throw new Meteor.Error("RobaRoute Failure", "Could not create route: action could not be found between " + step.nodeId + " and " + step.destinationId);
          }
        }
      }
      
      // store the route step
      this.route.push(step);
    }
  }
  
  /**
   * Create a clone of this route ready for storage
   */
  export () {
    return {
      feasible        : this.feasible,
      projectId       : this.destination.node.projectId,
      projectVersionId: this.destination.node.projectVersionId,
      platform        : this.destination.platform,
      userType        : this.destination.userType,
      destination     : this.destination.node,
      steps           : this.route
    }
  }
}
