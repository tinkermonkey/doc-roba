import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {Nodes} from '../../node/node.js';
import {RobaRouter} from '../roba_router.js';

Meteor.methods({
  /**
   * Load the navigation route for a navigation path
   * @param destinationId
   * @param sourceId
   * @param projectVersionId
   */
  loadNavigationRoute(destinationId, sourceId, projectVersionId) {
    check(Meteor.user(), Object);
    check(destinationId, String);
    check(sourceId, String);
    check(projectVersionId, String);
    
    // grab the nodes
    var destination = Nodes.findOne({staticId: destinationId, projectVersionId: projectVersionId}),
        source, route;
    
    if(sourceId){
      source = Nodes.findOne({staticId: sourceId, projectVersionId: projectVersionId});
    }
    
    // fetch the route
    try{
      route = source ? RobaRouter.nodeToNode(source, destination) : RobaRouter.routeFromStart();
      return route.export();
    } catch (error) {
      console.error("loadNavigationRoute failed: " + error.message);
    }
  },
});
