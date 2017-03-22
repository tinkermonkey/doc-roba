"use strict";

let assert         = require("assert"),
    fs             = require("fs"),
    path           = require("path"),
    moment         = require("moment"),
    log4js         = require("log4js"),
    DDPLogAppender = require('./server/ddp_log_appender'),
    LogAssistant;

if (!LogAssistant) {
  LogAssistant = {
    /**
     * LogAssistant centralizes the file and DDP logging for test and adventure automation
     * @param automationType The type of automation this log is for
     */
    type (automationType) {
      assert(automationType, "LogAssistant: automationType cannot be null");
      
      // Determine the path this log will be saved to
      this.type = automationType;
      
      // Create the log4js logger
      this.logger = log4js.getLogger(automationType);
      this.logger.info('LogAssistant created:', automationType);
      
      return this;
    },
    
    /**
     * Initialize the logging
     * @param recordId The recordId passed in from the command line
     * @param level The log level we're logging at
     */
    init (recordId, level) {
      this.logger.debug("LogAssistant.init:", recordId, level);
      let self        = this,
          partialPath = path.sep;
      
      assert(recordId, "LogAssistant.init: recordId cannot be null");
      self.logger.setLevel(level || 'INFO');
      
      // Determine the file that will be used
      self.recordId  = recordId;
      self.timestamp = moment().format("YYYY-MM-DD_HH-mm-ss");
      self.path      = path.join(fs.realpathSync(__dirname + '/../..'), 'logs', this.type, this.timestamp + '_' + this.recordId);
      self.file      = path.join(this.path, this.type + '.log');
      
      // Split the log path into each fs level and create them if they don't exist
      self.path.split(path.sep).forEach(function (pathPiece) {
        if (pathPiece.length) {
          partialPath = path.join(partialPath, pathPiece);
          if (!fs.existsSync(partialPath)) {
            self.logger.info("Creating directory:", partialPath);
            fs.mkdirSync(partialPath);
          }
        }
      });
      
      // Configure log4js
      //log4js.clearAppenders();
      log4js.loadAppender("file");
      self.logger.debug("LogAssistant.init adding log appender:", self.file);
      log4js.addAppender(log4js.appenders.file(self.file));
      
      // Hand back the log4js logger now that it's ready
      self.logger.info("LogAssistant initialized:", self.file);
      return self.logger;
    },
    
    /**
     * Add a DDP appender
     * @param serverLink
     * @param context
     */
    addDDP (serverLink, context) {
      this.logger.debug("LogAssistant.addDDP");
      let self = this;
      
      // Create the appender and add it to log4js
      self.ddpLogger = DDPLogAppender.createAppender(serverLink, context);
      log4js.addAppender(self.ddpLogger);
      
      // Log the file path now that DDP is connected
      self.logger.info("Log file:", self.file);
    },
    
    /**
     * Retrieve the logger
     */
    getLogger(){
      return this.logger
    },
    
    /**
     * Retrieve the logger
     */
    shutdown(code){
      log4js.shutdown(function () {
        setTimeout(function () {
          console.log("Calling process.exit");
          process.exit(code);
        }, 2000);
      });
    }
  };
}

module.exports = LogAssistant;