/**
 * ============================================================================
 * Node Reference Documentation
 * ============================================================================
 */
Collections.ReferenceDocs = new FS.Collection("reference_docs", {
  stores: [new FS.Store.FileSystem("reference_docs", { path: FS.basePath + "reference_docs" })]
});
Collections.ReferenceDocs.allow({
  insert:   allowIfAuthenticated,
  update:   allowIfAuthenticated,
  remove:   allowIfAuthenticated,
  download: allowIfAuthenticated
});
Collections.ReferenceDocs.deny({
  insert:   denyIfNotAuthenticated,
  update:   denyIfNotAuthenticated,
  remove:   denyIfNotAuthenticated,
  download: denyIfNotAuthenticated,
  fetch: ['projectId']
});
