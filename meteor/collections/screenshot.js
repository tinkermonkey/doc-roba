/**
 * ============================================================================
 * Screen shots from testing and adventures
 * ============================================================================
 */
ScreenShots = new FS.Collection("screenshots", {
  stores: [
    new FS.Store.FileSystem("thumbs", { path: FS.basePath + "screenshot_thumbs", transformWrite: FS.createThumb }),
    new FS.Store.FileSystem("screenshots", { path: FS.basePath + "screenshots" })
  ]
});
ScreenShots.allow({
  insert:   allowIfAuthenticated,
  update:   allowIfAuthenticated,
  remove:   allowIfAuthenticated,
  download: allowIfAuthenticated
});
ScreenShots.deny({
  insert:   denyIfNotAuthenticated,
  update:   denyIfNotAuthenticated,
  remove:   denyIfNotAuthenticated,
  download: denyIfNotAuthenticated,
  fetch: ['projectId']
});
