"use strict";

var _                = require('underscore'),
    assert           = require('assert'),
    log4js           = require('log4js'),
    logger           = log4js.getLogger('adventure'),
    RobaDriver       = require('./driver/roba_driver.js'),
    AdventureStep    = require('./adventure/adventure_step.js'),
    AdventureCommand = require('./adventure/adventure_command.js'),
    keepAliveWait    = 30,
    updatePeriod     = 2000,
    statePeriod      = 10000,
    pausePeriod      = 250,
    AdventureStatus, AdventureStepStatus;

logger.setLevel('DEBUG');

class Adventure {
  /**
   * Adventure
   * @param adventureId String
   * @param serverLink ServerLink
   * @param context RobaContext
   * @param logPath The path the folder to save images in
   */
  constructor (adventureId, serverLink, context, logPath) {
    logger.debug('Creating adventure:', adventureId, logPath);
    this._id        = adventureId;
    this.serverLink = serverLink;
    this.context    = context;
    this.logPath    = logPath;
    this.lastUrl    = '';
    
    // Two timers for controlling state updates
    this.lastChecked = Date.now();
    this.lastUpdated = Date.now();
  }
  
  /**
   * Initialize the adventure data
   */
  init () {
    logger.debug('Adventure.init:', this._id);
    var adventure = this;
    
    // Setup a listener to exit gracefully on sigint
    process.on("SIGINT", function () {
      logger.info("Exiting - SIGINT");
      adventure.exit(0);
    });
    
    // Load the enums needed for an adventure
    adventure.serverLink.enums = adventure.serverLink.call('loadAdventureEnums');
    Adventure.setEnums(adventure.serverLink.enums);
    
    // Load the adventure record
    logger.debug('Loading adventure record');
    adventure.record = adventure.serverLink.liveRecord('adventure', [ adventure._id ], 'adventures');
    logger.trace('Adventure loaded:', adventure);
    
    // Update the context
    adventure.context.update({
      projectId       : adventure.record.projectId,
      projectVersionId: adventure.record.projectVersionId,
      testAgentId     : adventure.record.testAgentId,
      serverId        : adventure.record.serverId
    });
    
    // Update the status to launched
    adventure.setStatus(AdventureStatus.launched);
    
    // Enter a context milestone marking the launch of the adventure
    adventure.context.milestone({ type: 'adventure', data: adventure.record });
    
    // Load the test system record
    logger.debug('Loading test system record');
    adventure.testSystem = adventure.serverLink.liveRecord('adventure_test_system', [ adventure.record.projectId, adventure.record.testSystemId ], 'test_systems');
    logger.trace('Test system: ', adventure.testSystem);
    
    // Load the test agent record
    logger.debug('Loading test agent record');
    adventure.testAgent = adventure.serverLink.liveRecord('adventure_test_agent', [ adventure.record.projectId, adventure.record.testAgentId ], 'test_agents');
    logger.trace('Test agent: ', adventure.testAgent);
    
    // Load the server record
    logger.debug('Loading test server record');
    adventure.testServer = adventure.serverLink.liveRecord('adventure_server', [ adventure.record.projectId, adventure.record.serverId ], 'test_servers');
    logger.trace('Test server: ', adventure.testServer);
    
    // Create the adventure step objects
    logger.debug('Creating adventure steps');
    adventure.stepRecords = adventure.serverLink.liveList('adventure_steps', [ adventure.record.projectId, adventure._id ]);
    logger.trace("Adventure steps:", adventure.stepRecords);
    if (adventure.stepRecords && _.keys(adventure.stepRecords).length) {
      adventure.steps = _.values(adventure.stepRecords).map((function (stepRecord, i) {
        return new AdventureStep(stepRecord, i, adventure).init();
      }));
    } else {
      logger.fatal("Fatal error: no steps found for adventure");
      throw new Error("Adventure contains no steps");
    }
  }
  
  /**
   * Connect to the test system
   */
  connect () {
    logger.debug('Adventure.connect:', this._id);
    var adventure = this,
        config    = {
          host               : adventure.testSystem.hostname,
          port               : adventure.testSystem.port,
          desiredCapabilities: {
            browserName : adventure.testAgent.identifier,
            loggingPrefs: { browser: 'ALL', driver: 'WARNING', client: 'WARNING', server: 'WARNING' }
          },
          logLevel           : 'silent',
          logPath            : adventure.logPath,
          end                : function (event) {
            logger.info('End event received from driver');
            adventure.driverEnded = true;
            if (!adventure.endIntentional) {
              logger.error('Driver end doesn`t look intentional:', event);
              adventure.setStatus(AdventureStatus.failed);
          
              // exit
              adventure.exit(1);
            }
          }
        };
    
    // Setup the driver
    logger.info('Creating RobaDriver');
    adventure.driver = new RobaDriver(config);
    
    // Set the timeouts for the driver
    logger.trace('Setting driver timeouts');
    adventure.driver.timeouts('implicit', 100);
    adventure.driver.timeouts('script', 5000);
    adventure.driver.timeouts('page load', 10000); // don't rely on this, and we don't want it getting in the way
    adventure.driver.timeoutsImplicitWait(100);
    adventure.driver.timeoutsAsyncScript(20000); // don't rely on this, and we don't want it getting in the way
    
    // Set the viewport if it's specified
    if (adventure.record.dataContext.viewport) {
      logger.debug('Setting viewport:', adventure.record.dataContext.viewport);
      try {
        var viewport = adventure.record.dataContext.viewport;
        adventure.driver.windowHandleSize({ width: viewport.width, height: viewport.height })
      } catch (e) {
        logger.error('Setting viewport failed:', e.toString(), e.stack);
      }
    }
  }
  
  /**
   * Execute the defined adventure steps
   */
  executeSteps () {
    logger.debug('Adventure.executeSteps:', this._id);
    var adventure  = this,
        stepPassed = true;
    
    // Prepare to execute
    adventure.context.backup();
    adventure.driver.getClientLogs();
    logger.trace("Executing Route: ", adventure.route);
    adventure.setStatus(AdventureStatus.routing);
    
    // Execute each step
    adventure.steps.forEach(function (step) {
      // If the previous step passed, keep executing
      if (stepPassed && !adventure.record.abort && !adventure.driverEnded) {
        try {
          adventure.checkForPause();
          stepPassed = step.execute();
        } catch (e) {
          logger.error("Step execution failed:", step.record, e.toString(), e.stack);
          step.setStatus(AdventureStepStatus.error);
          stepPassed = false;
        }
      } else {
        // Otherwise, skip this step
        step.skip();
      }
    });
  }
  
  /**
   * Sit around waiting for commands
   */
  waitForCommands () {
    logger.debug('Adventure.waitForCommands:', this._id);
    var adventure   = this,
        index       = 0,
        commandList = adventure.serverLink.liveList('adventure_commands', [ adventure.record.projectId, adventure._id ]),
        command;
    
    logger.trace('Adventure commands loaded: ', _.keys(adventure.commandList).length);
    adventure.setStatus(AdventureStatus.awaitingCommand);
    
    while (adventure.record.waitForCommands && !adventure.record.abort && !adventure.driverEnded) {
      // We have to do this to pick up the dynamic collection if it originally had zero commands
      if (!_.keys(commandList).length) {
        commandList = adventure.serverLink.ddp.collections.adventure_commands;
      }
      
      // Check for a new command
      if (index < _.keys(commandList).length) {
        logger.debug("Adventure command found at index", index);
        adventure.checkForPause();
        adventure.setStatus(AdventureStatus.executingCommand);
        
        // Create the command object
        command = new AdventureCommand(commandList[ _.keys(commandList)[ index ] ], index, adventure);
        
        // Execute the command
        try {
          command.execute();
        } catch (e) {
          logger.error("Command execution failed:", e.toString(), e.stack);
          command.setStatus(AdventureStepStatus.error);
        }
        
        // Update the state
        adventure.updateState(true);
        
        // Increment the counter
        index++;
        
        // Check so see if there were stacked up commands
        if (index >= _.keys(commandList).length) {
          adventure.setStatus(AdventureStatus.awaitingCommand);
        }
      } else {
        adventure.keepAlive();
      }
    }
  }
  
  /**
   * Wait for more commands
   */
  keepAlive () {
    logger.trace('Adventure.keepAlive');
    var adventure = this;
    
    try {
      // Wait politely
      adventure.driver.wait(keepAliveWait);
      
      // Update the state
      adventure.updateState();
    } catch (e) {
      logger.error("Exception encountered during keep-alive: ", e.toString(), e.stack);
    }
  }
  
  /**
   * Check to see if this adventure is paused
   */
  checkForPause () {
    logger.trace("CheckForPause: ", this.record.status == AdventureStatus.paused);
    while (this.record.status == AdventureStatus.paused) {
      this.driver.wait(pausePeriod);
    }
  }
  
  /**
   * Capture the adventure state
   * @param force Force an update
   */
  updateState (force) {
    logger.trace('Adventure.updateState:', force);
    var adventure = this,
        now       = Date.now(),
        state, currentUrl;
    
    // Check to see if we should send a keep-alive task to the driver
    if (now - adventure.lastChecked > updatePeriod || force) {
      logger.trace("Checking current url");
      currentUrl = adventure.driver.checkUrl();
      
      if ((currentUrl && currentUrl !== adventure.lastUrl) || (now - adventure.lastUpdated) > statePeriod || force) {
        logger.debug("Updating adventure state:", currentUrl, adventure.lastUrl);
        state = adventure.driver.getState();
        adventure.serverLink.saveAdventureState(adventure._id, state);
        
        // update the last url and the last update timestamp
        adventure.lastUrl = state.url;
        adventure.lastUpdated = Date.now();
      }
      
      // check the client logs
      adventure.driver.getClientLogs();
      
      // Note the time that url was checked
      adventure.lastChecked = Date.now();
    }
    
  }
  
  /**
   * Set the status of the adventure
   * @param status
   */
  setStatus (status) {
    var adventure = this;
    assert(status != null, 'Adventure.setStatus status cannot be null');
    
    logger.debug('Adventure.setStatus:', status);
    adventure.serverLink.call('setAdventureStatus', [ adventure._id, status ])
  }
  
  /**
   * Grab any enums needed, pass them around
   * @param enums
   */
  static setEnums (enums) {
    logger.trace('Adventure.setEnums:', enums);
    AdventureStatus     = enums.AdventureStatus;
    AdventureStepStatus = enums.AdventureStepStatus;
    AdventureStep.setEnums(enums);
    AdventureCommand.setEnums(enums);
  }
  
  /**
   * Exit the adventure
   * @param code
   */
  exit (code) {
    logger.info("Adventure.exit:", code);
    var adventure = this;
    
    // Shut down the driver
    try {
      adventure.endIntentional = true;
      logger.info("Ending web driver");
      adventure.driver.end();
    } catch (e) {
    }
    
    // Close the ddp link
    try {
      logger.info("Closing DDP Link");
      adventure.serverLink.disconnect();
    } catch (e) {
    }
    
    // Shut down the logger
    log4js.shutdown(function () {
      setTimeout(function () {
        console.log("Calling process.exit");
        process.exit(code);
      }, 2000);
    });
    
  }
}
;

module.exports = Adventure;