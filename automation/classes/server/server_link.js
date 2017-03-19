"use strict";

/**
 * Basic ddp client for helper functionality
 * With request to send images and logs via http
 */

// Dependencies
var Future        = require("fibers/future"),
    DDPClient     = require("ddp"),
    request       = require("request"),
    log4js        = require("log4js"),
    _             = require("underscore"),
    assert        = require("assert"),
    fs            = require("fs"),
    path          = require("path"),
    logger        = log4js.getLogger("server-link"),
    ddpLogger     = log4js.getLogger("ddp"),
    heartbeatTime = 15000, // ms between heartbeats
    defaultConfig = {
      ddp : {
        host               : "localhost",
        port               : 3000,
        ssl                : false,
        autoReconnect      : true,
        autoReconnectTimer : 500,
        maintainCollections: true,
        ddpVersion         : "pre2",
        useSockJs          : true
      },
      http: {
        transport: "http://"
      }
    };

logger.setLevel("DEBUG");
ddpLogger.setLevel("INFO");

class ServerLink {
  /**
   * ServerLink
   * @param projectId
   * @param config
   */
  constructor (projectId, config) {
    logger.debug("Creating new ServerLink");
    
    // Store the projectId for requests
    this.projectId = projectId;
    
    // Combine the config and defaults
    this.config           = _.defaults(config || {}, defaultConfig);
    this.config.serverUrl = this.config.http.transport + this.config.ddp.host + ":" + this.config.ddp.port + "/";
    
    // Create the ddp link
    this.ddp = new DDPClient(this.config.ddp);
    this.ddp.on("message", this.ddpMessageListener);
    this.ddp.on("socket-close", this.ddpSocketCloseListener);
    this.ddp.on("socket-error", this.ddpSocketErrorListener);
    
    // Create a data structure for observers
    this.observers = {};
    
    // Log all subscriptions
    this.subscriptions = [];
  }
  
  /**
   * Connect to the ddp server
   */
  connect (authToken) {
    logger.debug("ServerLink.connect: ", authToken);
    var link          = this,
        connectFuture = new Future();
    
    link.ddp.connect(function (error, wasReconnect) {
      if (error) {
        logger.error("ServerLink.connect error: ", error);
      }
      
      if (wasReconnect) {
        logger.info("ServerLink.connect: reconnected");
        
        // reconnect the subscriptions
        _.each(link.subscriptions, function (subscription) {
          logger.debug("Resubscribing: ", subscription.name);
          link.ddp.subscribe(subscription.name, subscription.params || []);
        })
      } else {
        logger.info("ServerLink.connect: connected");
      }
      
      // if this is the first time (eg. not a reconnect), make sure to resolve the future
      if (!connectFuture.resolved) {
        // if there is an authToken, try to use it
        if (authToken) {
          // try to authenticate
          console.log("Loggin in: ", authToken);
          link.ddp.call("login", [ { token: authToken } ], function (error, result) {
            if (error) {
              logger.error("Failed to authenticate: ", error.toString());
              throw new Error("Failed to authenticate");
            } else {
              logger.info("Authentication success");
              link.rawToken  = result.token;
              link.authToken = new Buffer(JSON.stringify({ authToken: result.token }), 'binary').toString('base64');
            }
            connectFuture.return(error);
          });
        } else {
          connectFuture.return(error);
        }
        
        // setup the heartbeat
        if (!link.heartbeatTimeout) {
          link.heartbeatTimeout = setInterval(function () {
            logger.trace("ServerLink: sending heartbeat");
            link.ddp.call("heartbeat", [], function (error, response) {
              if (error) {
                logger.error("Heartbeat error: ", error);
              } else {
                logger.trace("ServerLink heartbeat response: ", response)
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
  disconnect () {
    logger.trace("Calling ddp.close");
    this.ddp.close();
  };
  
  /**
   * Call a method on the ddp server
   */
  call (method, args) {
    var future = new Future();
    
    assert(method, "call: method must not be null");
    if (args) {
      assert(typeof args == "object", "call: args must be an array or object, not " + typeof(args));
    }
    
    logger.debug("Calling method: ", method);
    this.ddp.call(method, args, function (error, result) {
      if (error) {
        logger.error(method + ": ", error);
      }
      future.return(result);
    });
    
    var result = future.wait();
    if (result) {
      logger.trace("Call result: ", result);
    }
    return result;
  };
  
  /**
   * Load a TestResultRole manifect
   */
  loadTestRoleManifest (testResultRoleId) {
    assert(testResultRoleId, "loadTestRoleManifest: testResultRoleId must not be null");
    this.call("setTestSystemStatus", [ this.projectId, testResultRoleId ]);
  };
  
  /**
   * Update the test system status
   */
  setTestSystemStatus (testSystemId, status) {
    assert(testSystemId, "setTestSystemStatus: testSystemId must not be null");
    assert(status !== undefined, "setTestSystemStatus: status must not be null");
    this.call("setTestSystemStatus", [ this.projectId, testSystemId, status ]);
  };
  
  /**
   * Signal a failure of a test role
   */
  testRoleFailed (resultRoleId, data) {
    assert(resultRoleId, "testRoleFailed: resultRoleId must not be null");
    this.call("testRoleFailed", [ this.projectId, resultRoleId, data ]);
  };
  
  /**
   * Set the status of a testResultRole
   */
  setTestResultRoleStatus (resultRoleId, status) {
    assert(resultRoleId, "setTestResultRoleStatus: resultRoleId must not be null");
    assert(status !== undefined, "setTestResultRoleStatus: status must not be null");
    this.call("setTestResultRoleStatus", [ this.projectId, resultRoleId, status ]);
  };
  
  /**
   * Set the result code of a testResultRole
   */
  setTestResultRoleResult (resultRoleId, code, resultData) {
    assert(resultRoleId, "setTestResultRoleResult: resultRoleId must not be null");
    assert(code !== undefined, "setTestResultRoleResult: code must not be null");
    this.call("setTestResultRoleResult", [ this.projectId, resultRoleId, code, resultData ]);
  };
  
  /**
   * Set the status of a testResultStep
   */
  setTestResultStepStatus (stepResultId, status) {
    assert(stepResultId, "setTestResultStepStatus: stepResultId must not be null");
    assert(status !== undefined, "setTestResultStepStatus: status must not be null");
    this.call("setTestResultStepStatus", [ this.projectId, stepResultId, status ]);
  };
  
  /**
   * Set the status of a testResultStep
   */
  saveTestResultStepChecks (stepResultId, checks) {
    assert(stepResultId, "saveTestResultStepChecks: stepResultId must not be null");
    assert(checks, "saveTestResultStepChecks: status must not be null");
    this.call("saveTestResultStepChecks", [ this.projectId, stepResultId, checks ]);
  };
  
  /**
   * Set the result code of a testResultStep
   */
  setTestResultStepResult (stepResultId, code, resultData) {
    assert(stepResultId, "setTestResultStepResult: stepResultId must not be null");
    assert(code !== undefined, "setTestResultStepResult: code must not be null");
    this.call("setTestResultStepResult", [ this.projectId, stepResultId, code, resultData ]);
  };
  
  /**
   * Save the current state of an Adventure
   */
  saveAdventureState (adventureId, state) {
    assert(adventureId, "saveAdventureState: adventureId must not be null");
    this.call("saveAdventureState", [ this.projectId, adventureId, state ]);
  };
  
  /**
   * Pause an adventure
   */
  pauseAdventure (adventureId) {
    assert(adventureId, "pauseAdventure: adventureId must not be null");
    this.call("pauseAdventure", [ this.projectId, adventureId ]);
  };
  
  /**
   * Set the status of an adventure
   */
  setAdventureStatus (adventureId, status) {
    assert(adventureId, "setAdventureStatus: adventureId must not be null");
    assert(status !== undefined, "setAdventureStatus: status must not be null");
    this.call("setAdventureStatus", [ this.projectId, adventureId, status ]);
  };
  
  /**
   * Set the last known node for an adventure
   */
  setAdventureLocation (adventureId, nodeId) {
    assert(adventureId, "setAdventureLocation: adventureId must not be null");
    assert(nodeId, "setAdventureLocation: nodeId must not be null");
    this.call("setAdventureLocation", [ this.projectId, adventureId, nodeId ]);
  };
  
  /**
   * Save the status of a step
   */
  setAdventureStepStatus (stepId, status) {
    assert(stepId, "setAdventureStepStatus: stepId must not be null");
    assert(status !== undefined, "setAdventureStepStatus: status must not be null");
    this.call("setAdventureStepStatus", [ this.projectId, stepId, status ]);
  };
  
  /**
   * Save the result of a step validation or readyCheck
   * @param stepId
   * @param type
   * @param result
   */
  saveAdventureStepResult (stepId, type, result) {
    assert(stepId, "saveAdventureStepResult: stepId must not be null");
    assert(type, "saveAdventureStepResult: type must not be null");
    assert(result, "saveAdventureStepResult: result must not be null");
    this.call("saveAdventureStepResult", [ this.projectId, stepId, type, result ]);
  };
  
  /**
   * Set the status of an Adventure Command
   */
  setCommandStatus (commandId, status, result) {
    assert(commandId, "setCommandStatus: commandId must not be null");
    assert(status !== undefined, "setCommandStatus: status must not be null");
    this.call("setCommandStatus", [ this.projectId, commandId, status, result ]);
  };
  
  /**
   * Send an image with some context and optionally delete it
   * @imageFilePath The path of the stored image to send
   * @imageKey The key to use to identify this image and correlate it to other similar images
   */
  saveImage (imageFilePath, imageKey) {
    assert(imageFilePath, "saveImage: imageFilePath must not be null");
    assert(imageKey, "saveImage: imageKey must not be null");
    
    let ddp     = this,
        context = this.context.get();
    context.key = imageKey;
    
    // use http(s) for this and don't block on it
    fs.exists(imageFilePath, function (exists) {
      logger.debug("Saving image: ", imageFilePath);
      if (exists) {
        let filename = path.basename(imageFilePath),
            putUrl   = [
              ddp.config.serverUrl,
              "cfs/files/screenshots/?chunk=0&filename=",
              filename,
              "&token=",
              encodeURIComponent(ddp.authToken)
            ].join("");
        logger.debug("Saving image to url", putUrl);
        try {
          fs.createReadStream(imageFilePath)
              .pipe(request.put(putUrl, function (error, response, body) {
                if (error) {
                  logger.error("Saving image error: ", error);
                } else {
                  if (response.statusCode == 200) {
                    try {
                      var fileInfo = JSON.parse(body);
                      if (fileInfo._id) {
                        // can't use the future because we're already async
                        logger.debug("Updating screenshot context: ", fileInfo._id, context);
                        ddp.ddp.call("saveScreenshotContext", [ fileInfo._id, context ], function (error, result) {
                          if (error) {
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
  log (msg) {
    this.ddp.call("addLogMessage", [ msg ]);
  };
  
  /**
   * Subscribe to a collection which is expected to return a single record
   * @param subscription
   * @param params
   * @param collectionName
   * @param query A very simple "query" object whose key/value pairs will be used to find the intended record
   */
  liveRecord (subscription, params, collectionName, query) {
    logger.debug("liveRecord:", {
      subscription  : subscription,
      params        : params,
      collectionName: collectionName,
      query         : query
    });
    
    assert(subscription, "liveRecord: subscription must not be null");
    assert(params, "liveRecord: params must not be null");
    
    // Make sure params is an array
    if (!_.isArray(params)) {
      throw new Error("liveRecord params must be an array");
    }
    
    // default the collection name to the subscription name
    collectionName = collectionName || subscription;
    
    // Make note of the subscriptions
    this.subscriptions.push({ name: subscription, params: params });
    
    var future = new Future(), ddpClient = this.ddp;
    logger.trace("liveRecord creating subscription: ", subscription, params, collectionName);
    this.ddp.subscribe(subscription, params, function () {
      logger.trace("liveRecord subscribe returned: ", subscription, this);
      future.return();
    });
    future.wait();
    
    // hook up some observers
    var id       = _.last(params),
        observer = this.observers[ subscription + "_" + id ] = ddpClient.observe(collectionName);
    observer.added   = function (id) {
      logger.trace("A record was added to a subscription where it was not expected:", observer.name, id, ddpClient.collections[ observer.name ][ id ]);
    };
    observer.changed = function (id, oldFields, clearedFields) {
      logger.trace("liveRecord updated: ", observer.name, id, ddpClient.collections[ observer.name ][ id ]);
    };
    observer.removed = function (id, oldValue) {
      logger.error("A record was removed from a subscription where it was not expected to be:", observer.name, oldValue);
    };
    
    if (ddpClient.collections[ observer.name ]) {
      if (query) {
        // Find the first record whose attribute match the simple query object's attributes
        var record = _.find(_.values(ddpClient.collections[ observer.name ]), function (record) {
          return _.reduce(_.keys(query).map(function (key) {
            return record[ key ] == query[ key ]
          }), function (memo, match) {
            return memo && match
          }, true)
        });
        if (record) {
          id = record._id;
        }
      }
      
      // Use the _id field to identify the record
      logger.trace("LiveRecord returning record:", {
        collection: observer.name,
        id        : id,
        record    : ddpClient.collections[ observer.name ][ id ]
      });
      return ddpClient.collections[ observer.name ][ id ];
    } else {
      console.error("ServerLink.liveRecord failed with unknown collection:", observer.name);
    }
  };
  
  /**
   * Subscribe to a collection
   * @param subscription
   * @param params
   * @param collectionName
   */
  liveCollection (subscription, params, collectionName) {
    logger.debug("liveCollection:", {
      subscription  : subscription,
      params        : params,
      collectionName: collectionName
    });
    
    assert(subscription, "liveCollection: subscription must not be null");
    
    // Params must be null or an array
    if (params != null && !_.isArray(params)) {
      throw new Error("liveCollection params must be an array");
    }
    
    // Default the collection name to the subscription name
    collectionName = collectionName || subscription;
    
    // Store the subscription in case we need to reconnect to the server
    this.subscriptions.push({ name: subscription, params: params });
    
    var future = new Future();
    logger.trace("liveCollection creating subscription: ", subscription, params);
    this.ddp.subscribe(subscription, params || [], function () {
      logger.trace("liveCollection subscribe returned: ", subscription);
      future.return();
    });
    future.wait();
    
    // hook up some observers
    var ddpClient = this.ddp,
        observer  = this.observers[ subscription ] = ddpClient.observe(collectionName);
    observer.added   = function (id) {
      logger.trace("liveCollection record Added:", observer.name, id, ddpClient.collections[ observer.name ][ id ]);
    };
    observer.changed = function (id, oldFields, clearedFields) {
      logger.trace("liveCollection record Updated: ", observer.name, id, ddpClient.collections[ observer.name ][ id ]);
    };
    observer.removed = function (id, oldValue) {
      logger.trace("liveCollection record Removed:", observer.name, oldValue);
    };
    
    if (ddpClient.collections[ collectionName ]) {
      logger.trace("liveCollection returning:", {
        collection: observer.name,
        records   : ddpClient.collections[ collectionName ]
      });
      return ddpClient.collections[ collectionName ];
    } else {
      console.error("ServerLink.liveCollection failed with unknown collection:", collectionName);
    }
  };
  
  /**
   * Get a non-live list of records
   * @param subscription
   * @param params
   * @param collectionName
   * @param query
   */
  recordList (subscription, params, collectionName, query) {
    logger.debug("recordList:", {
      subscription  : subscription,
      params        : params,
      collectionName: collectionName,
      query         : query
    });
    
    assert(subscription, "recordList: subscription must not be null");
    
    // Params must be null or an array
    if (params != null && !_.isArray(params)) {
      throw new Error("recordList params must be an array");
    }
    
    // Default the collection name to the subscription name
    collectionName = collectionName || subscription;
    
    // Store the subscription in case we need to reconnect to the server
    this.subscriptions.push({ name: subscription, params: params });
    
    var future = new Future();
    logger.trace("recordList creating subscription: ", subscription, params);
    this.ddp.subscribe(subscription, params || [], function () {
      logger.trace("subscribe returned: ", subscription);
      future.return();
    });
    future.wait();
    
    // hook up some observers
    var ddpClient = this.ddp,
        observer  = this.observers[ subscription ] = ddpClient.observe(collectionName);
    observer.added   = function (id) {
      logger.trace("recordList record Added:", observer.name, id, ddpClient.collections[ observer.name ][ id ]);
    };
    observer.changed = function (id, oldFields, clearedFields) {
      logger.trace("recordList record Updated: ", observer.name, id, ddpClient.collections[ observer.name ][ id ]);
    };
    observer.removed = function (id, oldValue) {
      logger.trace("recordList record Removed:", observer.name, oldValue);
    };
    
    if (ddpClient.collections[ collectionName ]) {
      if (query) {
        // Find the first record whose attribute match the simple query object's attributes
        var records = _.filter(_.values(ddpClient.collections[ observer.name ]), function (record) {
          return _.reduce(_.keys(query).map(function (key) {
            return record[ key ] == query[ key ]
          }), function (memo, match) {
            return memo && match
          }, true)
        });
        logger.trace("recordList returning records by query:", {
          collection: observer.name,
          query     : query,
          records   : records
        });
        return records;
      } else {
        logger.trace("recordList returning records without query:", {
          collection: observer.name,
          records   : _.values(ddpClient.collections[ observer.name ])
        });
        return _.values(ddpClient.collections[ observer.name ]);
      }
    } else {
      console.error("ServerLink.recordList failed with unknown collection:", collectionName);
    }
  };
  
  /**
   * Sleep
   */
  sleep (length) {
    var future = new Future();
    logger.trace("sleep: ", length);
    setTimeout(function () {
      future.return();
    }, length || 1000);
    future.wait();
  };
  
  /**
   * Log ddp messages
   * @param msg
   */
  ddpMessageListener (msg) {
    ddpLogger.debug("DDP Message: ", msg);
  };
  
  /**
   * Log ddp messages
   * @param code
   * @param msg
   */
  ddpSocketCloseListener (code, msg) {
    ddpLogger.info("DDP Socket Close: ", code, msg);
  };
  
  /**
   * Log ddp messages
   * @param error
   */
  ddpSocketErrorListener (error) {
    ddpLogger.error("DDP Socket Error: ", error.message);
  };
}
;

module.exports = ServerLink;