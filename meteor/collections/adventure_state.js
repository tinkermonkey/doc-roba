/**
 * ============================================================================
 * The current state of an adventure (url, screenshot, etc)
 * ============================================================================
 */
// This collection is schema-less because it's just a black box
Collections.AdventureStates = new Mongo.Collection("adventure_states");
Collections.AdventureStates.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated
});

