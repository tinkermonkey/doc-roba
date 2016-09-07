import RobaRoute from './roba_route.js';

/**
 * Service for determining routes between nodes
 * @type {{routeToStart: Function}}
 */
export const RobaRouter = {
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
  nodeToNode    : function (source, destination) {
    return new RobaRoute(destination, source);
  }
};
