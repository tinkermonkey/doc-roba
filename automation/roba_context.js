/**
 * Basic centralized context tracking for the automation
 */
var _    = require("underscore"),
  log4js = require("log4js"),
  logger = log4js.getLogger("context");

/**
 * Constructor
 * @returns {RobaContext}
 * @constructor
 */
var RobaContext = function (context) {
  this.context = context || {};
  return this;
};

/**
 * Get a copy of the current context
 */
RobaContext.prototype.get = function () {
  return this.clone(this.context);
};

/**
 * Update some of the context
 * @param updatedContext
 */
RobaContext.prototype.update = function (updatedContext) {
  // break any references in the context
  var update = this.clone(updatedContext);
  _.extend(this.context, update);
};

/**
 * Remove a set of keys
 * @param keys
 */
RobaContext.prototype.remove = function (keys) {
  var rbc = this;
  keys = _.isString(keys) ? [keys] : keys;
  _.each(keys, function (key) {
    if(rbc.context.hasOwnProperty(key)){
      delete rbc.context[key]
    }
  })
};

/**
 * Overwrite the context
 * @param newContext
 */
RobaContext.prototype.set = function (newContext) {
  this.context = this.clone(newContext)
};

/**
 * Backup the context
 */
RobaContext.prototype.backup = function () {
  this.backup = this.clone(this.context)
};

/**
 * Restore the backup the context
 */
RobaContext.prototype.restore = function () {
  this.context = this.clone(this.backup)
};

/**
 * Log a milestone
 */
RobaContext.prototype.milestone = function (data) {
  logger.info(data);
};

/**
 * Stupid (simple) method to deep clone without references
 * @param context
 */
RobaContext.prototype.clone = function (context) {
  try{
    return JSON.parse(JSON.stringify(context))
  } catch (error) {
    console.error("Failed to clone object: ", context)
  }
};

/**
 * Export the class
 * @type {Function}
 */
module.exports = RobaContext;