/**
 * Basic ddp client for helper functionality
 * With request to send images and logs via http
 */

// Dependencies
var Future  = require("fibers/future"),
  DDPClient = require("ddp"),
  request   = require("request"),
  log4js    = require("log4js"),
  _         = require("underscore"),
  assert    = require("assert"),
  fs        = require("fs"),
  path      = require("path"),
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
    },
    http: {
      transport: "http://"
    }
  };

logger.setLevel("DEBUG");
ddpLogger.setLevel("INFO");

/**
 * Constructor
 */
var DDPLink = function (config, context) {
  logger.debug("Creating new DDPLink");

  // combine the config and defaults
  this.config = _.defaults(config || {}, defaultConfig);
  this.config.serverUrl = this.config.http.transport + this.config.ddp.host + ":" + this.config.ddp.port + "/";

  // set the context object
  this.context = context;

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
DDPLink.prototype.connect = function (singleUseToken) {
  logger.debug("ddplink.connect: ", singleUseToken);
  var link = this,
    connectFuture = new Future();

  link.ddp.connect(function(error, wasReconnect){
    if(error){
      logger.error("ddplink.connect error: ", error);
    }

    if(wasReconnect){
      logger.info("ddplink.connect: reconnected");

      // reconnect the subscriptions
      _.each(link.subscriptions, function (subscription) {
        logger.debug("Resubscribing: ", subscription.name);
        link.ddp.subscribe(subscription.name, subscription.params || []);
      })
    } else {
      logger.info("ddplink.connect: connected");
    }

    // if this is the first time (eg. not a reconnect), make sure to resolve the future
    if(!connectFuture.resolved){
      // if there is an singleUseToken, try to use it
      if(singleUseToken){
        // try to authenticate
        console.log("Loggin in: ", singleUseToken);
        link.ddp.call("login", [{token: singleUseToken}], function (error, result) {
          if(error){
            logger.error("Failed to authenticare: ", error.toString());
          } else {
            logger.info("Authentication success");
            link.rawToken = result.token;
            link.authToken = new Buffer(JSON.stringify({authToken: result.token}), 'binary').toString('base64');
          }
          connectFuture.return(error);
        });
      } else {
        connectFuture.return(error);
      }

      // setup the heartbeat
      if(!link.heartbeatTimeout){
        link.heartbeatTimeout = setInterval(function () {
          logger.trace("ddplink: sending heartbeat");
          link.ddp.call("heartbeat", [], function (error, response) {
            if(error){
              logger.error("Heartbeat error: ", error);
            } else {
              logger.trace("ddplink heartbeat response: ", response)
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

  assert(method, "call: method must not be null");
  if(args){
    assert(typeof args == "object", "call: args must be an array or object, not " + typeof(args));
  }

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
 * Set the result code of a testRoleResult
 */
DDPLink.prototype.setTestRoleResultCode = function (roleResultId, code) {
  assert(roleResultId, "setTestRoleResultCode: roleResultId must not be null");
  assert(code !== undefined, "setTestRoleResultCode: code must not be null");
  this.call("setTestRoleResultCode", [roleResultId, code]);
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
  assert(code !== undefined, "setTestStepResultCode: code must not be null");
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
 * Pause an adventure
 */
DDPLink.prototype.pauseAdventure = function (adventureId) {
  assert(adventureId, "pauseAdventure: adventureId must not be null");
  this.call("pauseAdventure", [adventureId]);
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
 * Send an image with some context and optionally delete it
 * @imageFilePath The path of the stored image to send
 * @imageKey The key to use to identify this image and correlate it to other similar images
 */
DDPLink.prototype.saveImage = function (imageFilePath, imageKey) {
  assert(imageFilePath, "saveImage: imageFilePath must not be null");
  assert(imageKey, "saveImage: imageKey must not be null");
  var ddp = this,
    context = this.context.get();
  context.key = imageKey;

  // use http(s) for this and don't block on it
  fs.exists(imageFilePath, function (exists) {
    logger.debug("Saving image: ", imageFilePath);
    if(exists){
      var filename = path.basename(imageFilePath),
        putUrl = [
          ddp.config.serverUrl,
          "cfs/files/screenshots/?chunk=0&filename=",
          filename,
          "&token=",
          encodeURIComponent(ddp.authToken)
        ].join("");
      logger.debug("Saving image to url", putUrl);
      try{
        fs.createReadStream(imageFilePath)
          .pipe(request.put(putUrl, function (error, response, body) {
            if(error){
              logger.error("Saving image error: ", error);
            } else {
              if(response.statusCode == 200){
                try {
                  var fileInfo = JSON.parse(body);
                  if(fileInfo._id){
                    // can't use the future because we're already async
                    logger.debug("Updating screenshot context: ", fileInfo._id, context);
                    ddp.ddp.call("saveScreenshotContext", [fileInfo._id, context], function (error, result) {
                      if(error){
                        logger.error("saveScreenshotContext failed: ", error, result);
                      }
                    });
                  } else {
                    logger.error("Image saving failed, no _id returned: ", body, response.statusCode);
                  }
                } catch (error) {
                  logger.error("Failed to parse image save response body: ", body, response.statusCode, error);
                }
              } else {
                logger.error("Saving image failed: ", response.statusCode, body);
              }

            }
          }));
      } catch (error) {
        logger.error("saveImage failed: ", error.toString());
      }
    } else {
      logger.error("saveImage failed, file not found: ", imageFilePath);
    }
  });
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