/**
 * Basic helpers for the tree display
 */
Template.DocTree.helpers({
  getName: function () {
    if(Meteor.user()) {
      return Meteor.user().profile.name;
    }
  }
});

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
      //self.treeLayout.masterNodeList = Nodes.find({projectVersionId: self.data.version._id}).fetch();
      self.treeLayout.nodeHandler.setNodes(Nodes.find({projectVersionId: self.data.version._id}).fetch());
      self.treeLayout.actionHandler.setActions(Actions.find({projectVersionId: self.data.version._id}).fetch());

      // get the mesh of navMenu actions
      self.treeLayout.actionHandler.setNavActions(Nodes.find({
        type: NodeTypes.navMenu, projectVersionId: self.data.version._id
      }).map(function (navMenu) {
        return {
          menu: navMenu,
          actions: Actions.find({
            projectVersionId: self.data.version._id,
            nodeId: navMenu.staticId
          }).fetch(),
          nodes: Nodes.find({
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
