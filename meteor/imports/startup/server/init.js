import { Meteor } from 'meteor/meteor';
import { FS } from 'meteor/cfs:base-package';
let fs   = require('fs'),
    path = require('path');

console.log("DocRoba initializing...");

// get better server side logging
console.debug = console.log;

/**
 * Enable debug for the moment
 */
FS.debug = true;

// TODO: Make this dynamic or a setting
if (Meteor.isServer) {
  FS.basePath = fs.realpathSync(path.join(process.env.PWD, "..", "files")) + path.sep;
  console.log('FS.basePath:', FS.basePath);
}

console.log("...complete");
