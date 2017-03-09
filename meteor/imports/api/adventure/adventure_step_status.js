export const AdventureStepStatus = {
  staged: 0,
  queued: 1,
  running: 2,
  complete: 3,
  error: 4,
  skipped: 5
};
export const AdventureStepStatusLookup = _.invert(AdventureStepStatus);
