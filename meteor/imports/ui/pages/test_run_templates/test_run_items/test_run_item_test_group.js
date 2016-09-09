/**
 * Template Helpers
 */
Template.TestRunItemTestGroup.helpers({
  getTestGroup: function () {
    return TestGroups.findOne({staticId: this.config.testGroupId, projectVersionId: this.projectVersionId});
  },
  getBreadcrumbs: function () {
    return Template.instance().getBreadcrumbs(this, [this.title]).reverse();
  },
  getTests: function () {
    return Template.instance().getTests(this);
  }
});

/**
 * Template Event Handlers
 */
Template.TestRunItemTestGroup.events({
  "click .test-group-expander": function (e, instance) {
    instance.$(".test-group-expander").toggleClass("rotate");
    //instance.$(".test-group-test-list").toggleClass("show");
    instance.$(".test-group-test-list").slideToggle();
  }
});

/**
 * Template Created
 */
Template.TestRunItemTestGroup.created = function () {
  let instance = Template.instance();

  // Get the breadcrumbs for the test group
  instance.getBreadcrumbs = function (item, breadcrumbs) {
    var parentId = item.testGroupId || item.parentGroupId;
    if(parentId){
      var parent = TestGroups.findOne({staticId: parentId, projectVersionId: item.projectVersionId});
      if(parent){
        breadcrumbs = breadcrumbs.concat(instance.getBreadcrumbs(parent, [parent.title]));
      }
    }
    return breadcrumbs;
  };

  // Get the list of tests in this group
  instance.getTests = function (group) {
    var tests = [];

    // get the tests
    TestCases.find({testGroupId: group.staticId, projectVersionId: group.projectVersionId}, {sort: {title: 1}}).forEach(function (test) {
      test.breadcrumbs = instance.getBreadcrumbs(test, [test.title]).reverse();
      tests.push(test);
    });

    // Get the tests for sub-groups
    TestGroups.find({parentGroupId: group.staticId, projectVersionId: group.projectVersionId}, {sort: {title: 1}}).forEach(function (child) {
      tests = tests.concat(instance.getTests(child));
    });

    return tests;
  };
};

/**
 * Template Rendered
 */
Template.TestRunItemTestGroup.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestRunItemTestGroup.destroyed = function () {
  
};
