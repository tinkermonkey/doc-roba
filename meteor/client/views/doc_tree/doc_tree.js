/**
 * Basic helpers for the tree display
 */
Template.DocTree.helpers({
  project: function () {
    return Template.project.get()
  },
  version: function () {
    return Template.version.get()
  }
});

/**
 * Template Created
 */
Template.DocTree.created = function () {
  var instance = this;
  instance.project = new ReactiveVar();
  instance.version = new ReactiveVar();

  instance.autorun(function () {
    var route = Router.current();
    instance.subscribe("nodes", route.params.projectId, route.params._id);
    instance.subscribe("actions", route.params.projectId, route.params._id);
    instance.subscribe("data_stores", route.params.projectId, route.params._id);// TODO: Move to lower level template
    instance.subscribe("all_data_store_fields", route.params.projectId, route.params._id);// TODO: Move to lower level template
    instance.subscribe("all_data_store_rows", route.params.projectId, route.params._id);// TODO: Move to lower level template
    instance.subscribe("servers", route.params.projectId, route.params._id);// TODO: Move to lower level template
    instance.subscribe("test_systems", route.params.projectId, route.params._id);// TODO: Move to lower level template
    instance.subscribe("test_agents", route.params.projectId, route.params._id);// TODO: Move to lower level template

    // pull in the project and project version records
    instance.project.set(Collections.Projects.findOne(route.params.projectId));
    instance.version.set(Collections.ProjectVersions.findOne(route.params._id));
  });
};

/**
 * Setup the tree display once the template is rendered
 */
Template.DocTree.rendered = function () {
  var self = this,
    viewState = Session.get("viewState"),
    nodeState = Session.get("nodeState");

  if(!self.init){
    self.init = true;
    // Setup the view only once
    self.treeLayout = new TreeLayout(self._elementId, self.data);

    // restore the cached node state
    self.treeLayout.nodeStateCache = nodeState || {};

    // restore a cached view
    if (viewState) {
      self.treeLayout.scaleAndTranslate(viewState.scale, viewState.translation);
    }

    // for the data binding we just need to setup an update call
    self.autorun(function () {
      Meteor.log.debug("Auto-run executing doc_tree: ", self.data);

      // get fresh node data
      self.treeLayout.nodeHandler.setNodes(Collections.Nodes.find({projectVersionId: self.data.version._id}).fetch());
      self.treeLayout.actionHandler.setActions(Collections.Actions.find({projectVersionId: self.data.version._id}).fetch());

      // get the mesh of navMenu actions
      self.treeLayout.actionHandler.setNavActions(Collections.Nodes.find({
        type: NodeTypes.navMenu, projectVersionId: self.data.version._id
      }).map(function (navMenu) {
        return {
          menu: navMenu,
          actions: Collections.Actions.find({
            projectVersionId: self.data.version._id,
            nodeId: navMenu.staticId
          }).fetch(),
          nodes: Collections.Nodes.find({
            projectVersionId: self.data.version._id,
            navMenus: navMenu.staticId
          }).map(function (node) { return node.staticId })
        }
      }));

      // restore the cached node state
      self.treeLayout.restoreCachedNodeState();

      // set up the base
      self.treeLayout.update();

      //self.treeLayout.updateActionDisplay();
    });

    // respond to resize events
    self.autorun(function () {
      Meteor.log.debug("Auto-run doc_tree resize");
      var resize = Session.get("resize");
      self.treeLayout.resize();
    });

    // Initialize the tree after setting up autorun so there is data to initialize
    self.treeLayout.init();
  }
};

/**
 * Setup the tree display once the template is rendered
 */
Template.DocTree.destroyed = function () {
  this.treeLayout.destroy();

  if(Session.get("drawerVisible")){
    BottomDrawer.hide();
  }
};
