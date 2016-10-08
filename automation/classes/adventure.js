"use strict";

var _             = require('underscore'),
    assert        = require('assert'),
    log4js        = require('log4js'),
    logger        = log4js.getLogger('adventure'),
    RobaDriver    = require('./driver/roba_driver.js'),
    AdventureStep = require('./adventure_step/adventure_step.js'),
    AdventureStatus;

logger.setLevel('DEBUG');

class Adventure {
  /**
   * Adventure
   * @param adventureId String
   * @param serverLink ServerLink
   * @param context RobaContext
   */
  constructor (adventureId, serverLink, context) {
    logger.debug('Creating adventure:', adventureId);
    this._id        = adventureId;
    this.serverLink = serverLink;
    this.context    = context;
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
    AdventureStatus            = adventure.serverLink.enums.AdventureStatus;
    AdventureStep.setStatusEnum(adventure.serverLink.enums.AdventureStepStatus);
    
    // Load the adventure record
    logger.debug('Loading adventure record');
    adventure.record = adventure.serverLink.liveRecord('adventure', adventure._id, 'adventures');
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
    adventure.testSystem = adventure.serverLink.liveRecord('adventure_test_system', adventure.record.testSystemId, 'test_systems');
    logger.trace('Test system: ', adventure.testSystem);
    
    // Load the test agent record
    logger.debug('Loading test agent record');
    adventure.testAgent = adventure.serverLink.liveRecord('adventure_test_agent', adventure.record.testAgentId, 'test_agents');
    logger.trace('Test agent: ', adventure.testAgent);
    
    // Load the server record
    logger.debug('Loading test server record');
    adventure.server = adventure.serverLink.liveRecord('adventure_server', adventure.record.serverId, 'test_servers');
    logger.trace('Test server: ', adventure.server);
    
    // Create the adventure step objects
    logger.debug('Creating adventure steps');
    adventure.stepRecords = adventure.serverLink.liveList('adventure_steps', [
      adventure.record.projectId,
      adventure.record.projectVersionId,
      adventure._id
    ]);
    logger.trace("Adventure steps:", adventure.stepRecords);
    if(adventure.stepRecords && adventure.stepRecords.length){
      adventure.steps = adventure.stepRecords.map(function (stepRecord, i) {
        return new AdventureStep(stepRecord, i, adventure).init();
      });
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
      if (stepPassed) {
        stepPassed = step.execute();
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
    var adventure = this;
    
    // Load the adventure commands
    logger.debug('Loading adventure commands');
    adventure.commandList = adventure.serverLink.liveList('adventure_commands', [ adventure._id ]);
    logger.trace('Adventure commands loaded: ', _.keys(adventure.commandList).length);
    
    // Create the command objects
    logger.debug('Creating command objects');
    adventure.commands = adventure.commandList.map(function (command) {
      return new AdventureStep(commands);
    });
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
   * Exit the adventure
   * @param code
   */
  exit (code) {
    logger.debug("Adventure.exit:", code);
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
        process.exit(code);
      }, 2000);
    });
    
  }
}
;

module.exports = Adventure;