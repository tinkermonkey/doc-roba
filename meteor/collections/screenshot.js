/**
 * ============================================================================
 * Screen shots from testing and adventures
 * ============================================================================
 */
Collections.Screenshots = new FS.Collection("screenshots", {
  stores: [
    new FS.Store.FileSystem("thumbs", { path: FS.basePath + "screenshot_thumbs", transformWrite: FS.createThumb }),
    new FS.Store.FileSystem("screenshots", { path: FS.basePath + "screenshots" })
  ]
});
Collections.Screenshots.deny({
  insert:   Auth.denyIfNoProjectAccess,
  update:   Auth.denyIfNoProjectAccess,
  remove:   Auth.denyIfNoProjectAccess,
  download: Auth.denyIfNoProjectAccess,
  fetch: ['projectId']
});
Collections.Screenshots.allow({
  insert:   Auth.allowIfAuthenticated,
  update:   Auth.allowIfAuthenticated,
  remove:   Auth.allowIfAuthenticated,
  download: Auth.allowIfAuthenticated
});

/**
 * Force a couple of helpers (collection helpers don't seem to work on FS.Collection)
 * This is shared server-side and client-side logic used by publications & helpers
 */
Collections.Screenshots.similarScreenshots = function (screenshot){
  if(screenshot){
    return Collections.Screenshots.find({
      _id: {$ne: screenshot._id},
      nodeId: screenshot.nodeId,
      projectVersionId: screenshot.projectVersionId,
      key: screenshot.key
    }, {sort: {uploadedAt: -1}, limit: 5})
  }
};

Collections.Screenshots.previousVersionScreenshots = function (screenshot){
  if(screenshot){
    // get the list of previous versions
    return Collections.Screenshots.find({
      _id: {$ne: screenshot._id},
      nodeId: screenshot.nodeId,
      projectVersionId: {$ne: screenshot.projectVersionId},
      key: screenshot.key
    }, {sort: {uploadedAt: -1}, limit: 5})
  }
};