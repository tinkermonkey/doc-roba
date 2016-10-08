"use strict";

var assert = require("assert"),
    fs     = require("fs"),
    path   = require("path"),
    moment = require("moment"),
    log4js = require("log4js"),
    DDPLogAppender = require('./server/ddp_log_appender');

class LogAssistant {
  /**
   * LogAssistant centralizes the file and DDP logging for test and adventure automation
   * @param automationType The type of automation this log is for
   * @param recordId The recordId passed in from the command line
   * @param level The log level we're logging at
   */
  constructor (automationType, recordId, level) {
    assert(automationType, "LogAssistant: automationType cannot be null");
    assert(recordId, "LogAssistant: recordId cannot be null");
    
    // Determine the path this log will be saved to
    this.type      = automationType;
    this.recordId  = recordId;
    this.timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
    this.path      = path.join(fs.realpathSync(__dirname + '/../..'), 'logs', this.type, this.timestamp + '_' + this.recordId);
    this.file      = path.join(this.path, this.type + '.log');
    
    // Setup the log4js logger
    this.logger = log4js.getLogger('doc-roba');
    this.logger.setLevel(level || 'INFO');
  
    this.logger.info("LogAssistant created:", this.file);
  }
  
  /**
   * Initialize the logging
   */
  init () {
    this.logger.debug("LogAssistant.init:", this.path);
    var assistant = this,
        partialPath = path.sep;
    
    // Split the log path into each fs level and create them if they don't exist
    assistant.path.split(path.sep).forEach(function (pathPiece) {
      if (pathPiece.length) {
        partialPath = path.join(partialPath, pathPiece);
        if (!fs.existsSync(partialPath)) {
          assistant.logger.info("Creating directory:", partialPath);
          fs.mkdirSync(partialPath);
        }
      }
    });
    
    // Configure log4js
    //log4js.clearAppenders();
    log4js.loadAppender("file");
    assistant.logger.debug("LogAssistant.init adding log appender:", assistant.file);
    log4js.addAppender(log4js.appenders.file(assistant.file));
    
    // Hand back the log4js logger now that it's ready
    return assistant.logger;
  }
  
  /**
   * Add a DDP appender
   * @param serverLink
   * @param context
   */
  addDDP (serverLink, context) {
    var assistant = this;
  
    // Create the appender and add it to log4js
    assistant.ddpLogger = DDPLogAppender.createAppender(serverLink, context);
    log4js.addAppender(assistant.ddpLogger);
    
    // Log the file path now that DDP is connected
    assistant.logger.info("Log file:", assistant.file);
  }
}

module.exports = LogAssistant;