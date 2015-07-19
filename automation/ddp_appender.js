"use strict";
var moment = require("moment"),
  startTime;

/**
 * context logging with events
 */
exports.createAppender = function createAppender (ddpLink, context) {
  startTime = Date.now();

  function logMsg (event) {
    return {
      time: (Date.now() - startTime) / 1000,
      timestamp: moment(event.startTime).valueOf(),
      level: event.level.levelStr,
      send: event.categoryName,
      context: context ? context.get() : null,
      data: event.data
    };
  }

  return function(loggingEvent) {
    if(ddpLink){
      ddpLink.log(logMsg(loggingEvent));
    } else {
      console.log("event: ", logMsg(loggingEvent));
    }
  };
};
