import { FS } from 'meteor/cfs:base-package';
import { Auth } from '../auth.js';

let basePath = FS.basePath;

/**
 * Screen shots from testing and adventures
 */
export const Screenshots = new FS.Collection("screenshots", {
  stores: [
    new FS.Store.FileSystem("thumbs", {
      path: basePath + "/screenshot_thumbs", transformWrite: function (fileObj, readStream, writeStream) {
        console.log('FS.createThumb:', fileObj.name());
        // Transform the image into a 200x200px thumbnail
        
        try {
          gm(readStream, fileObj.name()).resize("200", "200").stream().pipe(writeStream);
        } catch (e) {
          console.error('FS.createThumb caught exception in resize for thumb:', e);
        }
        /*
        try {
          gm(readStream).size({ bufferStream: true }, FS.Utility.safeCallback(function (err, size) {
            console.log('FS.createThumb in size callback:', fileObj.name());
            if (err) {
              // handle the error
              console.error('createThumb failed for image', fileObj.name(), ':', err);
            } else {
              //fileObj.update({$set: {'metadata.width': size.width, 'metadata.height': size.height}});
              try {
                this.resize("200", "200").stream().pipe(writeStream);
              } catch (e) {
                console.error('FS.createThumb caught exception in resize for thumb:', e);
              }
            }
          }));
        } catch (e) {
          console.error('FS.createThumb caught exception:', e);
        }
        */
      }
    }),
    new FS.Store.FileSystem("screenshots", { path: basePath + "screenshots" })
  ]
});
Screenshots.deny({
  insert  : () => {
    return false
  },
  update  : () => {
    return false
  },
  remove  : Auth.denyIfNoProjectAccess,
  download: Auth.denyIfNoProjectAccess,
  fetch   : [ 'projectId' ]
});
Screenshots.allow({
  insert  : () => {
    return true
  },
  update  : () => {
    return true
  },
  remove  : Auth.allowIfAuthenticated,
  download: Auth.allowIfAuthenticated
});

/**
 * Force a couple of helpers (collection helpers don't seem to work on FS.Collection)
 * This is shared server-side and client-side logic used by publications & helpers
 */
Screenshots.similarScreenshots = function (screenshot) {
  if (screenshot) {
    return Screenshots.find({
      _id             : { $ne: screenshot._id },
      nodeId          : screenshot.nodeId,
      projectVersionId: screenshot.projectVersionId,
      key             : screenshot.key
    }, { sort: { uploadedAt: -1 }, limit: 5 })
  }
};

Screenshots.previousVersionScreenshots = function (screenshot) {
  if (screenshot) {
    // get the list of previous versions
    return Screenshots.find({
      _id             : { $ne: screenshot._id },
      nodeId          : screenshot.nodeId,
      projectVersionId: { $ne: screenshot.projectVersionId },
      key             : screenshot.key
    }, { sort: { uploadedAt: -1 }, limit: 5 })
  }
};