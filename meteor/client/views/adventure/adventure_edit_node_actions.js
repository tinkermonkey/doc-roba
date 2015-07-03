/**
 * Template Helpers
 */
Template.AdventureEditNodeActions.helpers({
  getActions: function () {
    return Actions.find({nodeId: this.staticId, projectVersionId: this.projectVersionId}, {sort: {title: 1}})
  },
  getNavMenus: function () {
    var navs = [],
      node = this;
    _.each(node.navMenus, function (navMenuId) {
      var nav = Nodes.findOne({staticId: navMenuId, projectVersionId: node.projectVersionId});
      if(nav){
        nav.actions = Actions.find({nodeId: navMenuId, projectVersionId: node.projectVersionId}, {sort: {title: 1}});
        navs.push(nav);
      } else {
        Meteor.log.error("NavMenu node not found: ", navMenuID);
      }
    });
    return navs
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureEditNodeActions.events({
  "click .btn-close-action-edit-form": function (e, instance) {
    var view = Blaze.getView($(e.target).closest(".action-edit-form").get(0));
    $(e.target).closest("tr").addClass("hide");
    $(e.target).closest("tr").prev().find(".btn-edit-action").removeAttr("disabled");
    Blaze.remove(view);
  },
  "click .btn-add-action": function (e, instance) {
    e.stopImmediatePropagation();
    var node = this;

    if(node && node._id){
      Actions.insert({
        projectId: node.projectId,
        projectVersionId: node.projectVersionId,
        nodeId: node.staticId,
        routes: [{
          order: 0,
          nodeId: node.staticId
        }],
        title: 'New Action'
      }, function (error, result) {
        if(error){
          Meteor.log.error("Adding Action failed: " + error.message);
          Dialog.error("Adding Action failed: " + error.message);
        }
      });
    } else {
      Meteor.log.error("Adding Action failed, no node found");
      Dialog.error("Adding Action failed, no node found");
    }
  }
});

/**
 * Template Created
 */
Template.AdventureEditNodeActions.created = function () {
  
};

/**
 * Template Rendered
 */
Template.AdventureEditNodeActions.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.AdventureEditNodeActions.destroyed = function () {
  
};
