"use strict";
var moment = require("moment"),
    startTime;

/**
 * context logging with events
 */
exports.createAppender = function createAppender (serverLink, context) {
  startTime = Date.now();
  
  function logMsg (event) {
    return {
      time: (Date.now() - startTime) / 1000,
      timestamp: moment(event.startTime).valueOf(),
      level: event.level.levelStr,
      sender: event.categoryName,
      context: context ? context.get() : null,
      data: event.data
    };
  }
  
  return function(loggingEvent) {
    if(serverLink){
      serverLink.log(logMsg(loggingEvent));
    } else {
      console.log("event: ", logMsg(loggingEvent));
    }
  };
};
