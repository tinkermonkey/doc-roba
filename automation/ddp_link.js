/**
 * Basic ddp client for helper functionality
 */

// Dependencies
var Future  = require("fibers/future"),
  DDPClient = require("ddp"),
  log4js    = require("log4js"),
  _         = require("underscore"),
  assert    = require("assert"),
  logger    = log4js.getLogger("ddp-link"),
  ddpLogger = log4js.getLogger("ddp"),
  heartbeatTime = 15000, // ms between heartbeats
  defaultConfig = {
    ddp: {
      host : "localhost",
      port : 3000,
      ssl  : false,
      autoReconnect : true,
      autoReconnectTimer : 500,
      maintainCollections : true,
      ddpVersion : "pre2",
      useSockJs: true
    }
  };

logger.setLevel("INFO");
ddpLogger.setLevel("INFO");

/**
 * Constructor
 */
var DDPLink = function (config) {
  logger.debug("Creating new DDPLink");

  // combine the config and defaults
  this.config = _.defaults(config || {}, defaultConfig);

  // create the ddp link
  this.ddp = new DDPClient(this.config.ddp);
  this.ddp.on("message", this.ddpMessageListener);
  this.ddp.on("socket-close", this.ddpSocketCloseListener);
  this.ddp.on("socket-error", this.ddpSocketErrorListener);

  // create a data structure for observers
  this.observers = {};

  // log all subscriptions
  this.subscriptions = [];
};

/**
 * Connect to the ddp server
 */
DDPLink.prototype.connect = function () {
  var link = this,
    connectFuture = new Future();

  logger.debug("Calling ddp.connect");
  link.ddp.connect(function(error, wasReconnect){
    if(error){
      logger.error("Connect error: ", error);
    }

    if(wasReconnect){
      logger.info("Reconnected");

      // reconnect the subscriptions
      _.each(link.subscriptions, function (subscription) {
        logger.debug("Resubscribing: ", subscription.name);
        link.ddp.subscribe(subscription.name, subscription.params || []);
      })
    } else {
      logger.debug("Connected");
    }

    // if this is the first time (eg. not a reconnect), make sure to resolve the future
    if(!connectFuture.resolved){
      connectFuture.return(error);

      // setup the heartbeat
      if(!link.heartbeatTimeout){
        link.heartbeatTimeout = setInterval(function () {
          logger.debug("Sending heartbeat");
          link.ddp.call("heartbeat", [], function (error, response) {
            if(error){
              logger.error("Heartbeat error: ", error);
            } else {
              logger.debug("Heartbeat response: ", response)
            }
          });
        }, heartbeatTime)
      }
    }
  });

  var error = connectFuture.wait();
  if (error) {
    logger.error("DDP connection error:", error);
    link.disconnect();
    throw new Error(error);
  }

  logger.info("Connected");
};

/**
 * Disconnect the DDP link
 */
DDPLink.prototype.disconnect = function () {
  logger.trace("Calling ddp.close");
  this.ddp.close();
};

/**
 * Call a method on the ddp server
 */
DDPLink.prototype.call = function (method, args) {
  var future = new Future();

  logger.debug("Calling method: ", method);
  this.ddp.call(method, args, function (error, result) {
    if(error){
      logger.error(method + ": ", error);
    }
    future.return(result);
  });

  var result = future.wait();
  if(result){
    logger.trace("Call result: ", result);
  }
  return result;
};

/**
 * Update the test system status
 */
DDPLink.prototype.setTestSystemStatus = function (testSystemId, status) {
  assert(testSystemId, "setTestSystemStatus: testSystemId must not be null");
  assert(status !== undefined, "setTestSystemStatus: status must not be null");
  this.call("setTestSystemStatus", [testSystemId, status]);
};

/**
 * Set the status of a testRoleResult
 */
DDPLink.prototype.setTestRoleResultStatus = function (roleResultId, status) {
  assert(roleResultId, "setTestRoleResultStatus: roleResultId must not be null");
  assert(status !== undefined, "setTestRoleResultStatus: status must not be null");
  this.call("setTestRoleResultStatus", [roleResultId, status]);
};

/**
 * Set the status of a testStepResult
 */
DDPLink.prototype.setTestStepResultStatus = function (stepResultId, status) {
  assert(stepResultId, "setTestStepResultStatus: stepResultId must not be null");
  assert(status !== undefined, "setTestStepResultStatus: status must not be null");
  this.call("setTestStepResultStatus", [stepResultId, status]);
};

/**
 * Set the status of a testStepResult
 */
DDPLink.prototype.saveTestStepResultChecks = function (stepResultId, checks) {
  assert(stepResultId, "saveTestStepResultChecks: stepResultId must not be null");
  assert(checks, "saveTestStepResultChecks: status must not be null");
  this.call("saveTestStepResultChecks", [stepResultId, checks]);
};

/**
 * Set the result code of a testStepResult
 */
DDPLink.prototype.setTestStepResultCode = function (stepResultId, code) {
  assert(stepResultId, "setTestStepResultCode: stepResultId must not be null");
  assert(code, "setTestStepResultCode: status must not be null");
  this.call("setTestStepResultCode", [stepResultId, code]);
};

/**
 * Save the current state of an Adventure
 */
DDPLink.prototype.saveAdventureState = function (adventureId, state) {
  assert(adventureId, "saveAdventureState: adventureId must not be null");
  this.call("saveAdventureState", [adventureId, state]);
};

/**
 * Set the status of an adventure
 */
DDPLink.prototype.setAdventureStatus = function (adventureId, status) {
  assert(adventureId, "setAdventureStatus: adventureId must not be null");
  assert(status !== undefined, "setAdventureStatus: status must not be null");
  this.call("setAdventureStatus", [adventureId, status]);
};

/**
 * Set the last known node for an adventure
 */
DDPLink.prototype.setAdventureLocation = function (adventureId, nodeId) {
  assert(adventureId, "setAdventureLocation: adventureId must not be null");
  assert(nodeId, "setAdventureLocation: nodeId must not be null");
  this.call("setAdventureLocation", [adventureId, nodeId]);
};

/**
 * Save the status of a step
 */
DDPLink.prototype.setAdventureStepStatus = function (stepId, status) {
  assert(stepId, "setAdventureStepStatus: stepId must not be null");
  assert(status !== undefined, "setAdventureStepStatus: status must not be null");
  this.call("setAdventureStepStatus", [stepId, status]);
};

/**
 * Save the result of a step validation or readyCheck
 * @param stepId
 * @param type
 * @param result
 */
DDPLink.prototype.saveAdventureStepResult = function (stepId, type, result) {
  assert(stepId, "saveAdventureStepResult: stepId must not be null");
  assert(type, "saveAdventureStepResult: type must not be null");
  assert(result, "saveAdventureStepResult: result must not be null");
  this.call("saveAdventureStepResult", [stepId, type, result]);
};

/**
 * Set the status of an Adventure Command
 */
DDPLink.prototype.setCommandStatus = function (commandId, status, result) {
  assert(commandId, "setCommandStatus: commandId must not be null");
  assert(status !== undefined, "setCommandStatus: status must not be null");
  this.call("setCommandStatus", [commandId, status, result]);
};

/**
 * Save a screen capture from the test system
 */
DDPLink.prototype.saveScreen = function (actionId, image) {
  this.call("saveScreen", [actionId, image]);
};

/**
 * Save a log message
 * @param msg The message object to send to the server
 */
DDPLink.prototype.log = function (msg) {
  this.ddp.call("addLogMessage", [msg]);
};

/**
 * Subscribe to a collection which is expected to return a single record
 * @param subscription
 * @param id
 * @param callback
 */
DDPLink.prototype.liveRecord = function (subscription, id, collection) {
  assert(subscription, "liveRecord: subscription must not be null");
  assert(id, "liveRecord: id must not be null");

  // default the collection name to the subscription name
  collection = collection || subscription;

  // Make note of the subscriptions
  this.subscriptions.push({name: subscription, params: [id]});

  var future = new Future(), ddpClient = this.ddp;
  logger.debug("liveRecord: ", subscription, id, collection);
  this.ddp.subscribe(subscription, [id], function () {
    logger.trace("subscribe returned: ", subscription);
    future.return();
  });
  future.wait();

  // hook up some observers
  var observer = this.observers[subscription + "_" + id] = ddpClient.observe(collection);
  observer.added = function (id) {
    logger.trace("A record was added to a subscription where it was not expected:", observer.name, id, ddpClient.collections[observer.name][id]);
  };
  observer.changed = function (id, oldFields, clearedFields) {
    logger.trace("liveRecord updated: ", observer.name, id, ddpClient.collections[observer.name][id]);
  };
  observer.removed = function (id, oldValue) {
    logger.error("A record was removed from a subscription where it was not expected to be:", observer.name, oldValue);
  };

  return ddpClient.collections[observer.name][_.keys(ddpClient.collections[observer.name])[0]];
};

/**
 * Subscribe to a collection
 * @param subscription
 * @param params
 */
DDPLink.prototype.liveList = function (subscription, params, collection) {
  assert(subscription, "liveList: subscription must not be null");

  // default the collection name to the subscription name
  collection = collection || subscription;

  // Make note of the subscriptions
  this.subscriptions.push({name: subscription, params: params});

  var future = new Future();
  logger.debug("liveList: ", subscription, params);
  this.ddp.subscribe(subscription, params || [], function () {
    logger.trace("subscribe returned: ", subscription);
    future.return();
  });
  future.wait();

  // hook up some observers
  var ddpClient = this.ddp,
    observer = this.observers[subscription] = ddpClient.observe(collection);
  observer.added = function (id) {
    logger.trace("liveList record Added:", observer.name, id, ddpClient.collections[observer.name][id]);
  };
  observer.changed = function (id, oldFields, clearedFields) {
    logger.trace("liveList record Updated: ", observer.name, id, ddpClient.collections[observer.name][id]);
  };
  observer.removed = function (id, oldValue) {
    logger.trace("liveList record Removed:", observer.name, oldValue);
  };

  return ddpClient.collections[collection];
};

/**
 * Load a static node record from the server
 * @param staticId
 * @param projectVersionId
 */
DDPLink.prototype.loadNode = function (staticId, projectVersionId) {
  assert(staticId, "loadNode: staticId must not be null");
  assert(projectVersionId, "loadNode: projectVersionId must not be null");
  return this.call("loadNode", [staticId, projectVersionId]);
};

/**
 * Sleep
 */
DDPLink.prototype.sleep = function (length) {
  var future = new Future();
  logger.trace("sleep: ", length);
  setTimeout(function(){
    future.return();
  }, length || 1000);
  future.wait();
};

/**
 * Log ddp messages
 * @param msg
 */
DDPLink.prototype.ddpMessageListener = function (msg) {
  ddpLogger.debug("DDP Message: ", msg);
};

/**
 * Log ddp messages
 * @param code
 * @param msg
 */
DDPLink.prototype.ddpSocketCloseListener = function (code, msg) {
  ddpLogger.info("DDP Socket Close: ", code, msg);
};

/**
 * Log ddp messages
 * @param error
 */
DDPLink.prototype.ddpSocketErrorListener = function (error) {
  ddpLogger.error("DDP Socket Error: ", error.message);
};

/**
 * Export the DDPLink class
 * @type {Function}
 */
module.exports = DDPLink;