/**
 * ============================================================================
 * The current state of an adventure (url, screenshot, etc)
 * ============================================================================
 */
// This collection is schema-less because it's just a black box
AdventureStates = new Mongo.Collection("adventure_states");
AdventureStates.allow({
  insert: allowIfAuthenticated,
  update: allowIfAuthenticated
});

