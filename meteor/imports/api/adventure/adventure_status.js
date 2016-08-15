export const AdventureStatus = {
  staged: 0,
  queued: 1,
  launched: 2,
  routing: 3,
  executingCommand: 4,
  awaitingCommand: 5,
  paused: 6,
  complete: 7,
  error: 8,
  failed: 9
};
export const AdventureStatusLookup = _.invert(AdventureStatus);
