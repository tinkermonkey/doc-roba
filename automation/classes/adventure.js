"use strict";

var _                   = require('underscore'),
    assert              = require('assert'),
    log4js              = require('log4js'),
    logger              = log4js.getLogger('adventure'),
    RobaDriver          = require('./driver/roba_driver.js'),
    AdventureStep       = require('./adventure/adventure_step.js'),
    AdventureCommand    = require('./adventure/adventure_command.js'),
    AdventureStatus     = require('./enum/adventure_status.js'),
    AdventureStepStatus = require('./enum/adventure_step_status.js'),
    NodeCheckTypes      = require('./enum/node_check_types.js'),
    keepAliveWait       = 30,
    updatePeriod        = 2000,
    statePeriod         = 10000,
    pausePeriod         = 250;

logger.setLevel('DEBUG');

class Adventure {
  /**
   * Adventure
   * @param adventureId String
   * @param projectId String
   * @param serverLink ServerLink
   * @param context RobaContext
   * @param logPath The path the folder to save images in
   */
  constructor (adventureId, projectId, serverLink, context, logPath) {
    logger.debug('Creating adventure:', adventureId, projectId, logPath);
    this._id        = adventureId;
    this.projectId  = projectId;
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
    let self = this;
    
    // Setup a listener to exit gracefully on sigint
    process.on("SIGINT", function () {
      logger.info("Exiting - SIGINT");
      self.exit(0);
    });
    
    // Load the enums needed for an adventure
    self.loadEnums();
    
    // Load the adventure record
    logger.debug('Loading adventure record');
    self.record = self.serverLink.liveRecord('adventure', [ self.projectId, self._id ], 'adventures');
    logger.trace('Adventure loaded:', self.record);
    
    // Update the context
    self.context.update({
      projectId       : self.record.projectId,
      projectVersionId: self.record.projectVersionId,
      testAgentId     : self.record.testAgentId,
      serverId        : self.record.serverId
    });
    
    // Update the status to launched
    self.setStatus(AdventureStatus.launched);
    
    // Enter a context milestone marking the launch of the adventure
    self.context.milestone({ type: 'adventure', data: self.record });
    
    // Load the test system record
    logger.debug('Loading test system record');
    self.testSystem = self.serverLink.liveRecord('adventure_test_system', [
      self.record.projectId,
      self.record.testSystemId
    ], 'test_systems', { staticId: self.record.testSystemId });
    logger.trace('Test system: ', self.testSystem);
    
    // Load the test agent record
    logger.debug('Loading test agent record');
    self.testAgent = self.serverLink.liveRecord('adventure_test_agent', [
      self.record.projectId,
      self.record.testAgentId
    ], 'test_agents', { staticId: self.record.testAgentId });
    logger.trace('Test agent: ', self.testAgent);
    
    // Load the server record
    logger.debug('Loading test server record');
    self.testServer = self.serverLink.liveRecord('adventure_server', [
      self.record.projectId,
      self.record.serverId
    ], 'test_servers', { staticId: self.record.serverId });
    logger.trace('Test server: ', self.testServer);
    
    // Create the adventure step objects
    logger.debug('Creating adventure steps');
    self.stepRecords = self.serverLink.liveCollection('adventure_steps', [ self.record.projectId, self._id ]);
    logger.trace("Adventure steps:", self.stepRecords);
    if (self.stepRecords && _.keys(self.stepRecords).length) {
      self.steps = _.values(self.stepRecords).map((function (stepRecord, i) {
        let step = new AdventureStep(stepRecord, i, self);
        step.init();
        return step;
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
    let self   = this,
        config = {
          host               : self.testSystem.hostname,
          port               : self.testSystem.port,
          desiredCapabilities: {
            browserName : self.testAgent.identifier,
            loggingPrefs: { browser: 'ALL', driver: 'WARNING', client: 'WARNING', server: 'WARNING' }
          },
          logLevel           : 'silent',
          logPath            : self.logPath,
          end                : function (event) {
            logger.info('End event received from driver');
            self.driverEnded = true;
            if (!self.endIntentional) {
              logger.error('Driver end doesn`t look intentional:', event);
              self.setStatus(AdventureStatus.failed);
          
              // exit
              self.exit(1);
            }
          }
        };
    
    // Setup the driver
    logger.info('Creating RobaDriver');
    self.driver = new RobaDriver(config);
    
    // Set the timeouts for the driver
    logger.trace('Setting driver timeouts');
    self.driver.timeouts('implicit', 100);
    self.driver.timeouts('script', 5000);
    self.driver.timeouts('page load', 10000); // don't rely on this, and we don't want it getting in the way
    self.driver.timeoutsImplicitWait(100);
    self.driver.timeoutsAsyncScript(20000); // don't rely on this, and we don't want it getting in the way
    
    // Set the viewport if it's specified
    if (self.record.dataContext.viewport) {
      logger.debug('Setting viewport:', self.record.dataContext.viewport);
      try {
        let viewport = self.record.dataContext.viewport;
        self.driver.windowHandleSize({ width: viewport.width, height: viewport.height })
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
    let self       = this,
        stepPassed = true;
    
    // Prepare to execute
    self.context.backup();
    self.driver.getClientLogs();
    self.setStatus(AdventureStatus.routing);
    
    self.steps.forEach(function (step) {
      logger.info("Step pre-execution [", step.index, "]:", step.record, step.node.record, step.action && step.action.record);
    });
    
    // Execute each step
    self.steps.forEach(function (step) {
      // If the previous step passed, keep executing
      if (stepPassed && !self.record.abort && !self.driverEnded) {
        try {
          self.checkForPause();
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
    let self        = this,
        index       = 0,
        commandList = self.serverLink.liveCollection('adventure_commands', [ self.record.projectId, self._id ]),
        command;
    
    logger.trace('Adventure commands loaded: ', _.keys(self.commandList).length);
    self.setStatus(AdventureStatus.awaitingCommand);
    
    while (self.record.waitForCommands && !self.record.abort && !self.driverEnded) {
      // We have to do this to pick up the dynamic collection if it originally had zero commands
      if (!_.keys(commandList).length) {
        commandList = self.serverLink.ddp.collections.adventure_commands;
      }
      
      // Check for a new command
      if (index < _.keys(commandList).length) {
        logger.debug("Adventure command found at index", index);
        self.checkForPause();
        self.setStatus(AdventureStatus.executingCommand);
        
        // Create the command object
        command = new AdventureCommand(commandList[ _.keys(commandList)[ index ] ], index, self);
        
        // Execute the command
        try {
          command.execute();
        } catch (e) {
          logger.error("Command execution failed:", e.toString(), e.stack);
          command.setStatus(AdventureStepStatus.error);
        }
        
        // Update the state
        self.updateState(true);
        
        // Increment the counter
        index++;
        
        // Check so see if there were stacked up commands
        if (index >= _.keys(commandList).length) {
          self.setStatus(AdventureStatus.awaitingCommand);
        }
      } else {
        self.keepAlive();
      }
    }
  }
  
  /**
   * Wait for more commands
   */
  keepAlive () {
    logger.trace('Adventure.keepAlive');
    let self = this;
    
    try {
      // Wait politely
      self.driver.wait(keepAliveWait);
      
      // Update the state
      self.updateState();
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
    let self = this,
        now  = Date.now(),
        state, currentUrl;
    
    // Check to see if we should send a keep-alive task to the driver
    if (now - self.lastChecked > updatePeriod || force) {
      logger.trace("Checking current url");
      currentUrl = self.driver.checkUrl();
      
      if ((currentUrl && currentUrl !== self.lastUrl) || (now - self.lastUpdated) > statePeriod || force) {
        logger.debug("Updating adventure state:", currentUrl, self.lastUrl);
        state = self.driver.getState();
        self.serverLink.saveAdventureState(self._id, state);
        
        // update the last url and the last update timestamp
        self.lastUrl     = state.url;
        self.lastUpdated = Date.now();
      }
      
      // check the client logs
      self.driver.getClientLogs();
      
      // Note the time that url was checked
      self.lastChecked = Date.now();
    }
    
  }
  
  /**
   * Set the status of the adventure
   * @param status
   */
  setStatus (status) {
    let self = this;
    assert(status != null, 'Adventure.setStatus status cannot be null');
    
    logger.debug('Adventure.setStatus:', status);
    self.serverLink.setAdventureStatus(self._id, status);
  }
  
  /**
   * Load the needed enums from the server
   */
  loadEnums () {
    logger.trace('Adventure.loadEnums');
    let self = this;
    AdventureStatus.load(self.serverLink, logger);
    AdventureStepStatus.load(self.serverLink, logger);
    NodeCheckTypes.load(self.serverLink, logger);
  }
  
  /**
   * Exit the adventure
   * @param code
   */
  exit (code) {
    logger.info("Adventure.exit:", code);
    let self = this;
    
    // Shut down the driver
    try {
      self.endIntentional = true;
      logger.info("Ending web driver");
      self.driver.end();
    } catch (e) {
      logger.error('Error ending driver:', e.toString(), e.stack);
    }
    
    // Close the ddp link
    try {
      logger.info("Closing DDP Link");
      self.serverLink.disconnect();
    } catch (e) {
      logger.error('Error disconnected serverLink:', e.toString(), e.stack);
    }
  
    // Shut down the logger and exit
    LogAssistant.shutdown(code);
  }
}

module.exports = Adventure;