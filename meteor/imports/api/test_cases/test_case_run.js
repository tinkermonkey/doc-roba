/**
 * This is used for validating run configuration
 * @type {SimpleSchema}
 */
export const TestCaseRun = new SimpleSchema({
  serverId: {
    type: String
  },
  roles: {
    type: Object,
    blackbox: true
  },
  testRunId: {
    type: String,
    optional: true
  },
  pauseOnFailure: {
    type: Boolean,
    optional: true
  }
});
