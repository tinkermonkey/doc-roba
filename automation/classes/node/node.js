'use strict';

var log4js = require('log4js'),
    logger = log4js.getLogger('adventure'),
    NodeCheckTypes;

class Node {
  /**
   * Node
   * @param nodeId
   * @param projectId
   * @param projectVersionId
   * @param serverLink
   */
  constructor (nodeId, projectId, projectVersionId, serverLink) {
    logger.debug('Creating node:', nodeId);
    this._id         = nodeId;
    this.projectId        = projectId;
    this.projectVersionId = projectVersionId;
    this.serverLink       = serverLink;
  }
  
  /**
   * Load the records for this node
   * @return {Node}
   */
  init () {
    logger.debug('Initializing node:', this._id);
    var node = this;
    
    // Load the node record
    node.record = node.serverLink.liveRecord('node', [ node.projectId, node.projectVersionId, node._id ], 'nodes');
    if (!node.record) {
      throw new Error("Failed to load node " + node._id);
    }
    
    // Load all of the checks for this node
    node.readyChecks = node.serverLink.liveList('node_checks', [ node.projectId, node.projectVersionId, node.record.staticId, NodeCheckTypes.ready ]);
    node.validChecks = node.serverLink.liveList('node_checks', [ node.projectId, node.projectVersionId, node.record.staticId, NodeCheckTypes.valid ]);
    
    return this;
  }
  
  /**
   * Validate this node
   */
  validate () {
    logger.debug('Validating node:', this._id, this.record.title);
    var node  = this,
        valid = true;
    
    return valid
  }
  
  /**
   * Grab any enums needed, pass them around
   * @param enums
   */
  static setEnums (enums) {
    logger.trace('Node.setEnums:', enums);
    NodeCheckTypes = enums.NodeCheckTypes;
  }
}

module.exports = Node;