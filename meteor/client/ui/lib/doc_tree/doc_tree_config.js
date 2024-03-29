/**
 * Create a central location for all of the doc tree configuration
 * @type {{}}
 */
export const DocTreeConfig = {
  /**
   * Tree display configuration
   */
  tree: {
    stepDuration: 180,
    initialDuration: 120,
    highlightSurroundMargin: 30,
    dialogWidth: 360,
    dialogHeight: 100,
    dblClickTimeout: 250,
    viewTransitionTime: 333,
    popover: {
      transitionTime: 200,
      targetHeight: 450,
      targetWidth: 800,
      minHeight: 500,
      minWidth: 700
    }
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
    borderWidth: 3,
    titleHeight: 13,
    headerHeight: 20,
    xMargin: 50,
    yMargin: 50,
    xViewMargin: 120,
    yViewMargin: 50,
    cornerRadius: 6
  },

  /**
   * Standalone node display
   */
  standalone: {
    margin: 9
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
    hideTimer: 250, // ms to wait before hiding the controls after a mouse-leave
    textXMargin: 4,
    textYMargin: 3,
    cornerRadius: 3,
    tipCompensation: 3
  }
};
