/**
 * ============================================================================
 * Screen shots from testing and adventures
 * ============================================================================
 */
Screenshots = new FS.Collection("screenshots", {
  stores: [
    new FS.Store.FileSystem("thumbs", { path: FS.basePath + "screenshot_thumbs", transformWrite: FS.createThumb }),
    new FS.Store.FileSystem("screenshots", { path: FS.basePath + "screenshots" })
  ]
});
Screenshots.allow({
  insert:   allowIfAuthenticated,
  update:   allowIfAuthenticated,
  remove:   allowIfAuthenticated,
  download: allowIfAuthenticated
});
Screenshots.deny({
  insert:   denyIfNotAuthenticated,
  update:   denyIfNotAuthenticated,
  remove:   denyIfNotAuthenticated,
  download: denyIfNotAuthenticated,
  fetch: ['projectId']
});

/**
 * Force a couple of helpers (collection helpers don't seem to work on FS.Collection)
 * This is shared server-side and client-side logic used by publications & helpers
 */
Screenshots.similarScreenshots = function (screenshot){
  if(screenshot){
    return Screenshots.find({
      _id: {$ne: screenshot._id},
      nodeId: screenshot.nodeId,
      projectVersionId: screenshot.projectVersionId,
      key: screenshot.key
    }, {sort: {uploadedAt: -1}, limit: 5})
  }
};

Screenshots.previousVersionScreenshots = function (screenshot){
  if(screenshot){
    // get the list of previous versions
    return Screenshots.find({
      _id: {$ne: screenshot._id},
      nodeId: screenshot.nodeId,
      projectVersionId: {$ne: screenshot.projectVersionId},
      key: screenshot.key
    }, {sort: {uploadedAt: -1}, limit: 5})
  }
};