/**
 * Simple tool for assembling svg paths
 */
export const PathBuilder = {
  start() {
    return new Path();
  }
};

/**
 * The path constructor
 * @constructor
 */
var Path = function () {
  this.commands = [];
};

/**
 * Compile the path into a string
 * @returns {string} The compiled SVG path string
 */
Path.prototype.compile = function () {
  var path = "",
    args, pairs;
  _.each(this.commands, function (c) {
    if(c.args[0] && typeof c.args[0] == "object"){
      pairs = _.map(c.args, function (arg) { return arg.join(" "); });
      args = pairs.join(",");
    } else {
      args = c.args.join(" ");
    }
    path += c.command + args;
  });
  delete this.commands;
  return path;
};

/**
 * Move to relative
 * @param x
 * @param y
 */
Path.prototype.m = Path.prototype.moveToRelative = function (x, y) {
  this.commands.push({command: "m", args: [x,y]});
  return this;
};

/**
 * Move to absolute
 * @param x
 * @param y
 */
Path.prototype.M = Path.prototype.moveToAbsolute = function (x, y) {
  this.commands.push({command: "M", args: [x,y]});
  return this;
};

/**
 * Line to relative
 * @param x
 * @param y
 */
Path.prototype.l = Path.prototype.lineToRelative = function (x, y) {
  this.commands.push({command: "l", args: [x,y]});
  return this;
};

/**
 * Line to absolute
 * @param x
 * @param y
 */
Path.prototype.L = Path.prototype.lineToAbsolute = function (x, y) {
  this.commands.push({command: "L", args: [x,y]});
  return this;
};

/**
 * Horizontal line relative
 * @param x
 */
Path.prototype.h = Path.prototype.horizontalRelative = function (x) {
  this.commands.push({command: "h", args: [x]});
  return this;
};

/**
 * Horizontal line absolute
 * @param x
 */
Path.prototype.H = Path.prototype.horizontalAbsolute = function (x) {
  this.commands.push({command: "H", args: [x]});
  return this;
};

/**
 * Vertical line relative
 * @param y
 */
Path.prototype.v = Path.prototype.verticalRelative = function (y) {
  this.commands.push({command: "v", args: [y]});
  return this;
};

/**
 * Vertical line absolute
 * @param y
 */
Path.prototype.V = Path.prototype.verticalAbsolute = function (y) {
  this.commands.push({command: "V", args: [y]});
  return this;
};

/**
 * Close the line
 */
Path.prototype.z = Path.prototype.Z = Path.prototype.close = function () {
  this.commands.push({command: "Z", args: []});
  return this;
};

/**
 * Cubic Bezier relative
 * @param c1x Start control point x coordinate
 * @param c1y Start control point y coordinate
 * @param c2x End control point x coordinate
 * @param c2y End control point y coordinate
 * @param x End point x coordinate
 * @param y End point y coordinate
 */
Path.prototype.c = Path.prototype.cubicRelative = function (c1x, c1y, c2x, c2y, x, y) {
  this.commands.push({command: "c", args: [[c1x, c1y], [c2x, c2y], [x, y]]});
  return this;
};

/**
 * Cubic Bezier absolute
 * @param c1x Start control point x coordinate
 * @param c1y Start control point y coordinate
 * @param c2x End control point x coordinate
 * @param c2y End control point y coordinate
 * @param x End point x coordinate
 * @param y End point y coordinate
 */
Path.prototype.C = Path.prototype.cubicAbsolute = function (c1x, c1y, c2x, c2y, x, y) {
  this.commands.push({command: "C", args: [[c1x, c1y], [c2x, c2y], [x, y]]});
  return this;
};

/**
 * Cubic Bezier continuation relative
 * @param c2x End control point x coordinate
 * @param c2y End control point y coordinate
 * @param x End point x coordinate
 * @param y End point y coordinate
 */
Path.prototype.s = Path.prototype.cubicContinueRelative = function (c2x, c2y, x, y) {
  this.commands.push({command: "s", args: [[c2x, c2y], [x, y]]});
  return this;
};

/**
 * Cubic Bezier continuation absolute
 * @param c2x End control point x coordinate
 * @param c2y End control point y coordinate
 * @param x End point x coordinate
 * @param y End point y coordinate
 */
Path.prototype.S = Path.prototype.cubicContinueAbsolute = function (c2x, c2y, x, y) {
  this.commands.push({command: "S", args: [[c2x, c2y], [x, y]]});
  return this;
};

/**
 * Quadratic Bezier relative
 * @param cx Control point x coordinate
 * @param cy Control point y coordinate
 * @param x End point x coordinate
 * @param y End point y coordinate
 */
Path.prototype.q = Path.prototype.quadraticRelative = function (cx, cy, x, y) {
  this.commands.push({command: "q", args: [[cx, cy], [x, y]]});
  return this;
};

/**
 * Quadratic Bezier absolute
 * @param cx Control point x coordinate
 * @param cy Control point y coordinate
 * @param x End point x coordinate
 * @param y End point y coordinate
 */
Path.prototype.Q = Path.prototype.quadraticAbsolute = function (cx, cy, x, y) {
  this.commands.push({command: "Q", args: [[cx, cy], [x, y]]});
  return this;
};

/**
 * Quadratic Bezier continuation relative
 * @param x End point x coordinate
 * @param y End point y coordinate
 */
Path.prototype.t = Path.prototype.quadraticContinueRelative = function (x, y) {
  this.commands.push({command: "t", args: [x, y]});
  return this;
};

/**
 * Quadratic Bezier continuation absolute
 * @param x End point x coordinate
 * @param y End point y coordinate
 */
Path.prototype.T = Path.prototype.quadraticContinueAbsolute = function (x, y) {
  this.commands.push({command: "T", args: [x, y]});
  return this;
};

/**
 * Arc relative
 * @param cx Control point x coordinate
 * @param cy Control point y coordinate
 * @param x End point x coordinate
 * @param y End point y coordinate
 */
Path.prototype.a = Path.prototype.arcRelative = function (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
  this.commands.push({command: "a", args: [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y]});
  return this;
};

/**
 * Arc absolute
 * @param cx Control point x coordinate
 * @param cy Control point y coordinate
 * @param x End point x coordinate
 * @param y End point y coordinate
 */
Path.prototype.A = Path.prototype.arcAbsolute = function (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
  this.commands.push({command: "A", args: [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y]});
  return this;
};
