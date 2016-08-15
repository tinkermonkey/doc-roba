export const TestCaseRunRole = new SimpleSchema({
  testSystemId: {
    type: String
  },
  testAgentId: {
    type: String
  },
  accountId: {
    type: String
  },
  dataContext: {
    type: Object,
    optional: true
  }
});
