import "./doc_tree.html";
import { Template } from "meteor/templating";
import { Actions } from "../../../../imports/api/actions/actions.js";
import { Nodes } from "../../../../imports/api/nodes/nodes.js";
import { Projects } from "../../../../imports/api/projects/projects.js";
import { ProjectVersions } from "../../../../imports/api/projects/project_versions.js";
import { NodeTypes } from "../../../../imports/api/nodes/node_types.js";
import TreeLayout from "../../components/tree_layout/tree_layout.js";

/**
 * Basic helpers for the tree display
 */
Template.DocTree.helpers({
  project() {
    return Template.instance().project.get()
  },
  version() {
    return Template.instance().version.get()
  }
});

/**
 * Template Created
 */
Template.DocTree.created = function () {
  console.log("DocTree.created");
  
  var instance              = this;
  instance.project          = new ReactiveVar();
  instance.version          = new ReactiveVar();
  instance.elementIdReactor = new ReactiveVar();
  
  instance.autorun(function () {
    console.debug("DocTree.autorun updating subscriptions");
    var projectId        = FlowRouter.getParam("projectId"),
        projectVersionId = FlowRouter.getParam("projectVersionId");
    
    // Core data
    instance.subscribe("nodes", projectId, projectVersionId);
    instance.subscribe("all_node_checks", projectId, projectVersionId);
    instance.subscribe("actions", projectId, projectVersionId);
  
    // Datastores
    instance.subscribe("datastores", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("version_datastore_fields", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("datastore_data_types", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("version_datastore_data_type_fields", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("version_datastore_rows", projectId, projectVersionId);// TODO: Move to lower level template
  
    // Platform configuration
    instance.subscribe("platform_configurations", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("platform_operating_systems", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("platform_viewports", projectId, projectVersionId);// TODO: Move to lower level template
  
    // Test infrastructure
    instance.subscribe("test_servers", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("test_systems", projectId, projectVersionId);// TODO: Move to lower level template
    instance.subscribe("test_agents", projectId, projectVersionId);// TODO: Move to lower level template
    
    // pull in the project and project version records
    instance.project.set(Projects.findOne(projectId));
    instance.version.set(ProjectVersions.findOne(projectVersionId));
  });
  
  /**
   * Make sure the doc tree is ready
   *
   * @param project The project doc
   * @param version The projectVersion doc
   * @param nodes The nodes collection cursor
   * @param actions The actions collection cursor
   */
  instance.maintainTree = function (project, version, nodes, actions) {
    console.debug("DocTree.maintainTree:", project._id, version._id, nodes.count(), actions.count());
    var instance      = this,
        elementId     = instance.elementIdReactor.get(), // this is only set when the dom elements exist
        docTreeDataId = project._id + version._id;
    
    // Check for the presence of the element
    if (!elementId) {
      console.log("DocTree.maintainTree: not ready");
      return;
    }
    
    // Check for a reset state
    if (instance.inReset) {
      console.debug("DocTree.maintainTree: in reset", Date.now() - instance.inReset);
      
      // check to see if the base element exists
      if ($("#" + elementId).length) {
        console.debug("DocTree.maintainTree: exiting reset");
        instance.inReset = false;
      } else {
        console.debug("DocTree.maintainTree: scheduling maintain call");
        if (instance.checkTimeout) {
          clearTimeout(instance.checkTimeout);
        }
        instance.checkTimeout = setTimeout(function () {
          console.debug("DocTree.maintainTree: maintain call firing");
          instance.maintainTree(project, version, nodes, actions)
        }, 100);
        return;
      }
    }
    
    // Check for the need for a reset state
    if (instance.init && instance.init != docTreeDataId) {
      instance.resetTree();
      return;
    }
    
    console.debug("DocTree.maintainTree: ready");
    
    // initialize if needed
    if (!instance.init) {
      instance.createTree(project, version);
    }
    
    // update the tree
    instance.updateTree(project, version);
    
    // call init once
    if (!instance.init) {
      // Initialize the tree after setting up autorun so there is data to initialize
      instance.initTree(docTreeDataId);
    }
  };
  
  /**
   * Create the DocTree
   *
   * @param project The project doc
   * @param version The projectVersion doc
   */
  instance.createTree = function (project, version) {
    console.debug("DocTree.createTree:", project._id, version._id);
    var instance  = this,
        viewState = Session.get("viewState"),
        nodeState = Session.get("nodeState");
    
    // Setup the view only once
    console.debug("DocTree.createTree creating tree layout with element " + instance.elementId);
    instance.treeLayout = new TreeLayout(instance.elementId, { version: version, project: project });
    
    // restore the cached node state
    instance.treeLayout.nodeStateCache = nodeState || {};
    
    // restore a cached view
    if (viewState) {
      instance.treeLayout.scaleAndTranslate(viewState.scale, viewState.translation);
    }
  };
  
  /**
   * Update the DocTree data
   *
   * @param project The project doc
   * @param version The projectVersion doc
   */
  instance.updateTree = function (project, version) {
    console.debug("DocTree.updateTree:", project._id, version._id);
    let instance = Template.instance();
    
    // get fresh node data
    instance.treeLayout.nodeHandler.setNodes(Nodes.find({ projectVersionId: version._id }).fetch());
    instance.treeLayout.actionHandler.setActions(Actions.find({ projectVersionId: version._id }).fetch());
    
    // get the mesh of navMenu actions
    instance.treeLayout.actionHandler.setNavActions(Nodes.find({
      type: NodeTypes.navMenu, projectVersionId: version._id
    }).map(function (navMenu) {
      return {
        menu   : navMenu,
        actions: Actions.find({
          projectVersionId: version._id,
          nodeId          : navMenu.staticId
        }).fetch(),
        nodes  : Nodes.find({
          projectVersionId: version._id,
          navMenus        : navMenu.staticId
        }).map(function (node) {
          return node.staticId
        })
      }
    }));
    
    // restore the cached node state
    instance.treeLayout.restoreCachedNodeState();
    
    // set up the base
    instance.treeLayout.update();
  };
  
  /**
   * Initialize the DocTree
   *
   * @param docTreeDataId The project/version combo identendifying the current project & version
   */
  instance.initTree = function (docTreeDataId) {
    console.debug("DocTree.initTree");
    let instance = Template.instance();
    
    instance.init = docTreeDataId;
    instance.treeLayout.init();
    console.debug("DocTree.initTree complete");
  };
  
  /**
   * Reset the DocTree
   */
  instance.resetTree = function () {
    console.debug("DocTree.resetTree");
    let instance = Template.instance();
    
    instance.init    = false;
    instance.inReset = Date.now();
    instance.treeLayout.destroy();
    delete instance.treeLayout;
  };
};

/**
 * Setup the tree display once the template is rendered
 */
Template.DocTree.rendered = function () {
  var instance  = this;
  
  // for the data binding we just need to setup an update call
  instance.autorun(function () {
    var version = instance.version.get(),
        project = instance.project.get(),
        nodes   = Nodes.find({ projectVersionId: version._id }),
        actions = Actions.find({ projectVersionId: version._id });
    
    // Maintain the tree
    if(instance.subscriptionsReady()){
      console.log('DocTree autorun - subscriptions ready');
      instance.maintainTree(project, version, nodes, actions);
    } else {
      console.log('DocTree autorun - subscriptions not ready')
    }
  });
  
  // respond to resize events
  instance.autorun(function () {
    var resize = Session.get("resize");
    if (instance.treeLayout) {
      console.debug("DocTree resize");
      instance.treeLayout.resize();
    }
  });
};

/**
 * Setup the tree display once the template is rendered
 */
Template.DocTree.destroyed = function () {
  console.debug("DocTree.destroyed");
  this.treeLayout.destroy();
};
