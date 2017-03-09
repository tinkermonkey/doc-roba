import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import {Nodes} from '../../nodes/nodes.js';
import {RobaRouter} from '../roba_router.js';

Meteor.methods({
  /**
   * Load the navigation route for a navigation path
   * @param destinationId
   * @param sourceId
   * @param projectVersionId
   */
  loadNavigationRoute(destinationId, sourceId, projectVersionId) {
    check(Meteor.userId(), String);
    check(destinationId, String);
    check(sourceId, String);
    check(projectVersionId, String);
    
    // grab the nodes
    var destination = Nodes.findOne({staticId: destinationId, projectVersionId: projectVersionId}).withChecks(),
        source, route;
    
    if(sourceId){
      source = Nodes.findOne({staticId: sourceId, projectVersionId: projectVersionId}).withChecks();
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
