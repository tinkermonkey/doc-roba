/**
 * Template Helpers
 */
Template.TestRunItemTestCase.helpers({
  getTestCase: function () {
    return Collections.TestCases.findOne({staticId: this.config.testCaseId, projectVersionId: this.projectVersionId});
  },
  getBreadcrumbs: function () {
    var instance = Template.instance();
    return instance.getBreadcrumbs(this, [this.title]).reverse();
  }
});

/**
 * Template Event Handlers
 */
Template.TestRunItemTestCase.events({});

/**
 * Template Created
 */
Template.TestRunItemTestCase.created = function () {
  var instance = this;
  instance.getBreadcrumbs = function (item, breadcrumbs) {
    var parentId = item.testGroupId || item.parentGroupId;
    if(parentId){
      var parent = Collections.TestGroups.findOne({staticId: parentId, projectVersionId: item.projectVersionId});
      if(parent){
        breadcrumbs = breadcrumbs.concat(instance.getBreadcrumbs(parent, [parent.title]));
      }
    }
    return breadcrumbs;
  }
};

/**
 * Template Rendered
 */
Template.TestRunItemTestCase.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestRunItemTestCase.destroyed = function () {
  
};
