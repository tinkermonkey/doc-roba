import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';
import {Auth} from '../../auth.js';
import {Actions} from '../../actions/actions.js';
import {Nodes} from '../nodes.js';
import {RecordChanges} from '../../change_tracker/record_changes.js';

Meteor.methods({
  /**
   * Delete a node from a project version (and only from this version!)
   * Also delete items linking to this node (Actions, variants, etc)
   * @param nodeId
   */
  deleteNode(nodeId) {
    console.debug("deleteNode:" + nodeId);
    var user = Auth.requireAuthentication();
    
    if (nodeId) {
      var node = Nodes.findOne(nodeId),
          actionRemoveList = [];
      
      if (node) {
        // Get all of the from this node
        Actions.find({nodeId: node.staticId, projectVersionId: node.projectVersionId}).forEach((a) => {
          RecordChanges.remove({collection: "actions", recordId: a._id});
          actionRemoveList.push(a._id);
        });
        
        // Find all of the actions which lead to this node and remove the routes
        Actions.find({"routes.nodeId": node.staticId, projectVersionId: node.projectVersionId}).forEach((a) => {
          // if the action only leads
          var otherRoutes = a.routes.filter((route) => {
            return route.nodeId !== node.staticId
          });
          if (!otherRoutes.length) {
            RecordChanges.remove({collection: "actions", recordId: a._id});
            actionRemoveList.push(a._id);
          } else {
            // update the action to remove the route
            Actions.update({_id: a._id}, {$pull: {routes: {nodeId: node.staticId}}});
          }
        });
        
        // remove all of the actions which link to this node
        Actions.remove({_id: {$in: actionRemoveList}});
        
        // Remove all of the documentation for this node
        
        // Remove the node itself
        Nodes.remove({_id: nodeId});
        
        // Remove the change history for this node
        RecordChanges.remove({collection: "nodes", recordId: nodeId});
      } else {
        throw new Meteor.Error("Node not found: " + nodeId);
      }
    }
  },
  
  /**
   * Create a code module for a user type node
   * @param projectId
   * @param projectVersionId
   * @param userTypeId Node.staticId
   */
  createUserTypeCodeModule(projectId, projectVersionId, userTypeId){
    console.debug("createUserTypeCodeModule:", projectId, projectVersionId, userTypeId);
    check(projectId, String);
    check(projectVersionId, String);
    check(userTypeId, String);
    
    let user = Auth.requireProjectAccess(projectId),
        userType = Nodes.findOne({projectVersionId: projectVersionId, staticId: userTypeId});
    return userType.codeModule();
  },
  
  /**
   * Create a data store for a user type node
   * @param projectId
   * @param projectVersionId
   * @param userTypeId Node.staticId
   */
  createUserTypeDatastore(projectId, projectVersionId, userTypeId){
    console.debug("createUserTypeDatastore:", projectId, projectVersionId, userTypeId);
    check(projectId, String);
    check(projectVersionId, String);
    check(userTypeId, String);
    
    let user = Auth.requireProjectAccess(projectId),
        userType = Nodes.findOne({projectVersionId: projectVersionId, staticId: userTypeId});
    return userType.dataStore();
  },
  
  /**
   * Create a platform configuration for a platform node
   * @param projectId
   * @param projectVersionId
   * @param platformId Node.staticId
   */
  createPlatformConfiguration(projectId, projectVersionId, platformId){
    console.debug("createPlatformConfiguration:", projectId, projectVersionId, platformId);
    check(projectId, String);
    check(projectVersionId, String);
    check(platformId, String);
    
    let user = Auth.requireProjectAccess(projectId),
        platform = Nodes.findOne({projectVersionId: projectVersionId, staticId: platformId});
    return platform.platformConfig();
  }
});
