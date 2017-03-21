'use strict';

var log4js         = require('log4js'),
    logger         = log4js.getLogger('node'),
    CodeExecutor   = require('../code_executor/code_executor.js'),
    ReadyChecker   = require('./ready_checker.js'),
    ValidChecker   = require('./valid_checker.js'),
    NodeCheckTypes = require('../enum/node_check_types.js');

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
    this.staticId         = nodeId;
    this.projectId        = projectId;
    this.projectVersionId = projectVersionId;
    this.serverLink       = serverLink;
  }
  
  /**
   * Load the records for this node
   * @return {Node}
   */
  init () {
    logger.debug('Initializing node:', this.staticId);
    var node = this;
    
    // Load the node record
    node.record = node.serverLink.liveRecord('node', [ node.projectId, node.projectVersionId, node.staticId ], 'nodes', { staticId: node.staticId });
    if (!node.record) {
      throw new Error("Failed to load node " + node.staticId);
    }
    logger.trace("Node record loaded:", node.record);
    
    // Load all of the checks for this node
    node.readyChecks = node.serverLink.recordList('node_checks', [
      node.projectId,
      node.projectVersionId,
      node.record.staticId,
      NodeCheckTypes.ready
    ], 'node_checks', { type: NodeCheckTypes.ready });
    
    node.validChecks = node.serverLink.recordList('node_checks', [
      node.projectId,
      node.projectVersionId,
      node.record.staticId,
      NodeCheckTypes.valid
    ], 'node_checks', { type: NodeCheckTypes.valid });
    
    // Create the code executors for ready and valid checks
    node.readyExecutor = new CodeExecutor(node.record.readyCode);
    node.validExecutor = new CodeExecutor(node.record.validationCode);
    
    return this;
  }
  
  /**
   * Check to see if this node is ready
   * @param driver
   * @param dataContext
   */
  checkReady (driver, dataContext) {
    logger.debug('Check if node is ready:', this.staticId, this.record.title);
    var node         = this,
        readyChecker = new ReadyChecker(driver),
        result       = {
          pass : true,
          error: null
        };
    
    // Add context variable
    node.readyExecutor.addVariable('driver', driver);
    node.readyExecutor.addVariable('ready', readyChecker);
    node.readyExecutor.addVariable('dataContext', dataContext);
    
    // Execute the ready code for this node
    try {
      node.readyExecutor.execute();
      result.pass = readyChecker.check();
      logger.debug("Ready code result: ", result);
    } catch (e) {
      logger.error("Ready code failed: ", e.toString(), e.stack);
      result.pass  = false;
      result.error = e;
    }
    
    return result
  }
  
  /**
   * Validate this node
   * @param driver
   * @param dataContext
   */
  validate (driver, dataContext) {
    logger.debug('Validating node:', this.staticId, this.record.title);
    var node         = this,
        validChecker = new ValidChecker(driver),
        result       = {
          pass : true,
          error: null
        };
    
    // Add context variable
    node.validExecutor.addVariable('driver', driver);
    node.validExecutor.addVariable('valid', validChecker);
    node.validExecutor.addVariable('dataContext', dataContext);
    
    try {
      node.validExecutor.execute();
      result.pass = validChecker.check();
      logger.debug("Valid code result: ", result);
    } catch (e) {
      logger.error("Valid code failed: ", e.toString(), e.stack);
      result.pass  = false;
      result.error = e;
    }
    
    return result
  }
  
  /**
   * Add a context variable for both ready and valid checkers
   * @param name
   * @param value
   * @param defaultValue
   */
  addVariable (name, value, defaultValue) {
    this.readyExecutor.addVariable(name, value, defaultValue);
    this.validExecutor.addVariable(name, value, defaultValue);
  }
}

module.exports = Node;