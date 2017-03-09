export const TestResultStatus = {
  staged: 0,
  queued: 1,
  launched: 2,
  executing: 3,
  paused: 4,
  complete: 5,
  skipped: 6
};
export const TestResultStatusLookup = _.invert(TestResultStatus);
