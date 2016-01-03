/**
 * Basic helpers for the tree display
 */
Template.DocTree.helpers({
  project: function () {
    return Template.instance().project.get()
  },
  version: function () {
    return Template.instance().version.get()
  }
});

/**
 * Template Created
 */
Template.DocTree.created = function () {
  var instance = this;
  instance.project = new ReactiveVar();
  instance.version = new ReactiveVar();
  instance._elementIdReactor = new ReactiveVar();

  instance.autorun(function () {
    var route = Router.current();
    instance.subscribe("nodes", route.params.projectId, route.params.projectVersionId);
    instance.subscribe("actions", route.params.projectId, route.params.projectVersionId);
    instance.subscribe("data_stores", route.params.projectId, route.params.projectVersionId);// TODO: Move to lower level template
    instance.subscribe("all_data_store_fields", route.params.projectId, route.params.projectVersionId);// TODO: Move to lower level template
    instance.subscribe("all_data_store_rows", route.params.projectId, route.params.projectVersionId);// TODO: Move to lower level template
    instance.subscribe("servers", route.params.projectId, route.params.projectVersionId);// TODO: Move to lower level template
    instance.subscribe("test_systems", route.params.projectId, route.params.projectVersionId);// TODO: Move to lower level template
    instance.subscribe("test_agents", route.params.projectId, route.params.projectVersionId);// TODO: Move to lower level template

    // pull in the project and project version records
    instance.project.set(Collections.Projects.findOne(route.params.projectId));
    instance.version.set(Collections.ProjectVersions.findOne(route.params.projectVersionId));
  });
};

/**
 * Setup the tree display once the template is rendered
 */
Template.DocTree.rendered = function () {
  var instance = this,
      // We don't actually want these to be reactive in the auto-run because it could create a loop
      viewState = Session.get("viewState"),
      nodeState = Session.get("nodeState");

  // for the data binding we just need to setup an update call
  instance.autorun(function () {
    var version = instance.version.get(),
        project = instance.project.get(),
        elementId = instance._elementIdReactor.get(), // this is only set when the dom elements exist
        subsReady = instance.subscriptionsReady();

    if(subsReady && elementId){
      // initialize once
      if(!instance.init){
        // Setup the view only once
        Meteor.log.debug("DocTree: creating tree layout " + instance._elementId);
        instance.treeLayout = new TreeLayout(instance._elementId, {version: version, project: project});

        // restore the cached node state
        instance.treeLayout.nodeStateCache = nodeState || {};

        // restore a cached view
        if (viewState) {
          instance.treeLayout.scaleAndTranslate(viewState.scale, viewState.translation);
        }

        Meteor.log.debug("DocTree Nodes:" + Collections.Nodes.find({projectVersionId: version._id}).count());
        Meteor.log.debug("DocTree Actions:" + Collections.Actions.find({projectVersionId: version._id}).count());
      }

      // get fresh node data
      instance.treeLayout.nodeHandler.setNodes(Collections.Nodes.find({projectVersionId: version._id}).fetch());
      instance.treeLayout.actionHandler.setActions(Collections.Actions.find({projectVersionId: version._id}).fetch());

      // get the mesh of navMenu actions
      instance.treeLayout.actionHandler.setNavActions(Collections.Nodes.find({
        type: NodeTypes.navMenu, projectVersionId: version._id
      }).map(function (navMenu) {
        return {
          menu: navMenu,
          actions: Collections.Actions.find({
            projectVersionId: version._id,
            nodeId: navMenu.staticId
          }).fetch(),
          nodes: Collections.Nodes.find({
            projectVersionId: version._id,
            navMenus: navMenu.staticId
          }).map(function (node) { return node.staticId })
        }
      }));

      // restore the cached node state
      instance.treeLayout.restoreCachedNodeState();

      // set up the base
      instance.treeLayout.update();

      // call init once
      if(!instance.init){
        Meteor.log.debug("DocTree initialization complete");
        // Initialize the tree after setting up autorun so there is data to initialize
        instance.init = true;
        instance.treeLayout.init();
      }
    }
  });

  // respond to resize events
  instance.autorun(function () {
    var resize = Session.get("resize");
    if(instance.treeLayout){
      Meteor.log.debug("DocTree resize");
      instance.treeLayout.resize();
    }
  });
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
