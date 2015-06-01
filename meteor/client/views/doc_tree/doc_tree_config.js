/**
 * Create a central location for all of the doc tree configuration
 * @type {{}}
 */
DocTreeConfig = {
  /**
   * Tree display configuration
   */
  tree: {
    xMargin: 60,
    yMargin: 60,
    xViewMargin: 60,
    yViewMargin: 60,
    cornerRadius: 5,
    stepDuration: 180,
    initialDuration: 120,
    highlightSurroundMargin: 30,
    dialogWidth: 360,
    dialogHeight: 100,
    dblClickTimeout: 250,
    bottomDrawerHeight: 300,
    viewTransitionTime: 333
  },
  /**
   * Inset View configuration
   */
  insetView: {
    radius: 100,
    margin: 30,
    scaleFactor: 0.9
  },
  /**
   * Node display configuration
   */
  nodes: {
    rootRadius: 60,
    width: 80,
    height: 60,
    borderWidth: 1,
    titleHeight: 13,
    headerHeight: 20,
    xMargin: 50,
    yMargin: 50,
    xViewMargin: 60,
    yViewMargin: 50,
    cornerRadius: 3
  },
  /**
   * Node controls configuration
   */
  nodeControls: {
    hideTimer: 1000, // ms to wait before hiding the controls after a mouse-leave
    transitionTimer: 120
  },
  /**
   * Drop Nodes
   */
  dropNodes: {

  },
  /**
   * Actions
   */
  actions: {
    hideTimer: 120, // ms to wait before hiding the controls after a mouse-leave
    textXMargin: 8,
    textYMargin: 8,
    cornerRadius: 3
  }
};

/**
 * Helpers to return configuration
 */
Template.registerHelper("nodeConfig", function (key) {
  return DocTreeConfig.nodes[key];
});
