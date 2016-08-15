import {Meteor} from 'meteor/meteor';
import {FS} from 'meteor/cfs:base-package';
let fs = require('fs'),
    path = require('path');

/**
 * Enable debug for the moment
 */
FS.debug = true;

// TODO: Make this dynamic or a setting
if(Meteor.isServer){
  Meteor.startup(function () {
    FS.basePath = fs.realpathSync(path.join(process.env.PWD, "..", "files"));
  });
}


/**
 * Thumbnail processor
 */
FS.createThumb = function(fileObj, readStream, writeStream) {
  // Transform the image into a 200x200px thumbnail
  gm(readStream, fileObj.name()).resize("200", "200").stream().pipe(writeStream);
};
