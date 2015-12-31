/**
 * ============================================================================
 * Node Reference Documentation
 * ============================================================================
 */
Collections.ReferenceDocs = new FS.Collection("reference_docs", {
  stores: [new FS.Store.FileSystem("reference_docs", { path: FS.basePath + "reference_docs" })]
});
Collections.ReferenceDocs.deny(Auth.ruleSets.deny.ifNoProjectAccess);
Collections.ReferenceDocs.allow(Auth.ruleSets.allow.ifAuthenticated);
