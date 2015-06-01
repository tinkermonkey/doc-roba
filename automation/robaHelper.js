/**
 * robaHelper.js
 *
 * Simple executor for web automation
 *
 */
var Future      = require("fibers/future"),
  fs            = require("fs"),
  spawn         = require("child_process").spawn,
  log4js        = require("log4js"),
  ddpAppender   = require("./ddp_appender"),
  logger        = log4js.getLogger("helper"),
  DDPLink       = require("./ddp_link"),
  helperId       = process.argv[2],
  logPath       = fs.realpathSync(__dirname + "/../docroba/.logs/helpers"),
  logFile       = logPath + "/" + helperId + ".log",
  adventureRunnerPath = fs.realpathSync(__dirname + "/executeAdventure.js"),
  ddpLink;

if(!helperId){
  console.error("No helperId specified");
  process.exit(1);
}

// make sure the log directory exists
if(!fs.existsSync(logPath)){
  console.log("Creating log directory: ", logPath);
  fs.mkdirSync(logPath);
}

// Get the logging setup
log4js.loadAppender("file");
logger.setLevel("DEBUG");

logger.debug("Adding log appender: ", logFile);
log4js.addAppender(log4js.appenders.file(logFile));

/**
 * Setup basic signal handling
 */
process.on( "SIGINT", function() {
  logger.info("Exiting - SIGINT");

  // close the ddp link
  try {
    logger.info("Closing DDP Link");
    ddpLink.disconnect();
  } catch (e) {}

  // end the logger
  log4js.shutdown(function(){
    setTimeout(function(){
      process.exit();
    }, 1000);
  });
});

// Main loop
Future.task(function(){
  // Create the helper
  logger.info("Helper " + helperId + " launched");
  ddpLink = new DDPLink();

  // Connect to the server
  ddpLink.connect();

  // Create the ddpLogger
  var ddpLogger = ddpAppender.createAppender(ddpLink);
  log4js.addAppender(ddpLogger);
  ddpAppender.setContext(helperId);

  // Set the status
  ddpLink.setTestSystemStatus(helperId, "Idle");

  // Check for a adventure
  var adventureId,
    child,
    runOnce = false,
    stopFlag = false;
  while(!ddpLink.checkForKill(helperId) && !stopFlag){
    logger.trace("Checking for adventure");
    adventureId = ddpLink.getNextAdventureId(helperId);
    if(adventureId){
      // Update the status of the helper
      logger.debug("Executing adventure: ", adventureId);
      ddpLink.setTestSystemStatus(helperId, "Executing");
      ddpLink.setAdventureStatus(adventureId, "Executing");

      // execute the adventure
      var childFuture = new Future();
      logger.debug("Launching adventure: ", adventureRunnerPath);
      child = spawn("node", [adventureRunnerPath, adventureId]);
      logger.debug("Child launched: ", child.pid);

      // Make sure stderr is captured
      child.stdout.on("data", function (data) { console.log(data.toString().trim()); });
      child.stderr.on("data", function (data) { console.log(data.toString().trim()); });

      // listen for the child thread end
      child.on("exit", function (code) {
        childFuture.return(code);
      });

      // Sit around and wait
      var code = childFuture.wait();
      logger.debug("Child finished: ", code);

      // Make sure the adventure is marked as complete
      var status = ddpLink.getAdventureStatus(adventureId);
      if(status.match(/executing/i)){
        ddpLink.setAdventureStatus(adventureId, "Complete");
      }

      // Done
      ddpLink.setTestSystemStatus(helperId, "Idle");
    } else {
      if(runOnce) {
        stopFlag = true;
      } else {
        ddpLink.sleep(5000);
      }
    }
  }
  logger.debug("Disconnecting ddp link");
  ddpLink.disconnect();

  logger.info("Helper execution complete");
}).detach();
