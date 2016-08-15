/**
 * Template Helpers
 */
Template.nodes_change.helpers({
  /**
   * Pull in the retrieved record along with the
   */
  combineData: function () {
    var change = this;
    change.project = Projects.findOne({ _id: change.projectId });
    change.projectVersion = ProjectVersions.findOne({ _id: change.projectVersionId });
    return change;
  },
  isUpdated: function () {
    return this.type === ChangeTypes.updated;
  },
  isCreated: function () {
    return this.type === ChangeTypes.created;
  },
  isDestroyed: function () {
    return this.type === ChangeTypes.destroyed;
  }
});

/**
 * Template Helpers
 */
Template.nodes_change.events({});

/**
 * Template Rendered
 */
Template.nodes_change.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.nodes_change.destroyed = function () {

};
