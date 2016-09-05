import { DocTreeConfig } from "../../lib/doc_tree/doc_tree_config.js";
import { TreeUtils } from "../../components/tree_layout/tree_utils.js";

/**
 * Custom tree layout for providing navigational guidance
 */
export default class MapLayout {
  constructor (elementId, context, config) {
    var self = this;
    
    // store the container element
    self.container = $("#" + elementId);
    
    // store the project context
    self.context = context;
    
    // set the default config
    self.config = config || {};
    _.defaults(self.config, DocTreeConfig.tree);
    
    // initialize the master node list and link list
    self.scale       = 1; // Default scale for the main tree view
    self.translation = [ 0, 0 ]; // Default translation for the main tree view
    
    // New state storage structure
    self.state = {
      selectedNodes: [],
      edit         : {},
      inDrag       : false
    };
    
    // New view state storage
    self.view = {
      width      : self.container.innerWidth(),
      height     : self.container.innerHeight(),
      scale      : 1,
      translation: [ 0, 0 ]
    };
    
    // set the width and height
    self.width  = self.container.innerWidth() - parseInt(self.container.css('margin-right')) - parseInt(self.container.css('margin-left')) * 2;
    self.height = self.container.innerHeight() - parseInt(self.container.css('margin-top')) - parseInt(self.container.css('margin-bottom')) * 2;
    
    // set the container bounds
    self.layoutRoot = d3.select("#" + elementId);
    
    // Setup the panning-zoomer
    console.debug("Configuring zoomer");
    self.zoomer = d3.behavior.zoom(".global-layer")
        .scaleExtent([ 0.25, 1.5 ])
        .on("zoom", function () {
          self.scaleAndTranslate(d3.event.scale, d3.event.translate);
        });
    self.layoutRoot
    //.select(".inset-layer")
        .call(self.zoomer);
    
    // setup the main svg element
    console.debug("Configuring svg element");
    
    // Select frequently used items
    self.defs           = self.layoutRoot.select(".base-defs");
    self.clipFrame      = self.layoutRoot.select("#map-clip-path circle");
    self.frame          = self.layoutRoot.select(".map-frame");
    self.highlightLayer = self.layoutRoot.select(".node-highlight-layer");
    
    // Pick up a reference to the highlighting circle
    self.highlightGroup  = self.layoutRoot.select(".centered-node-highlight");
    self.highlightCircle = self.highlightGroup.select(".node-controls-back");
    
    // create the node handler
    self.nodeHandler = new TreeNodeHandler(self, self.config.nodes);
    self.nodeHandler.initDefs();
    
    // create the action handler
    self.actionHandler = new TreeActionHandler(self, self.config.actions);
    
    // create the node handler
    self.linkHandler = new TreeLinkHandler(self, self.config.links);
  }
  
  /**
   * Setup the initial view
   */
  init () {
    var self = this;
    
    console.info("MapLayout.init");
    this.scaleAndTranslate(self.scale, self.translation);
  }
  
  /**
   * Scrub all of the source data and update all of the links
   */
  prepData () {
    var self = this;
    
    // Initialize the link data
    self.linkHandler.prepLinks();
    
    // make sure all of the nodes are expanded
    _.each(self.nodeHandler.nodeList, function (node) {
      node.logExpanded = true;
      node.visExpanded = true;
    });
    
    // Update the nodes
    self.nodeHandler.prepNodes();
    
    // Invalidate all of the unused links
    self.linkHandler.cleanLinks();
    
    // Update the actions
    self.actionHandler.prepActions();
  }
  
  /**
   * Resize to fix the window
   */
  updateSize () {
    var self = this;
    
    // Measure the new dimensions
    self.width  = self.container.innerWidth() - parseInt(self.container.css('margin-right')) - parseInt(self.container.css('margin-left'));
    self.height = self.container.innerHeight() - parseInt(self.container.css('margin-top')) - parseInt(self.container.css('margin-bottom'));
  }
  
  /**
   * Resize to fix the window
   */
  resize () {
    var self = this;
    
    // Measure the new dimensions
    self.updateSize();
    
    // resize the frame and clip path
    //var radius = (Math.min(self.width, self.height) - 40) / 2;
    //self.clipFrame.attr("r", radius);
    //self.frame.attr("r", radius);
    
    // Update the display
    self.update();
  }
  
  /**
   * Destroy!
   */
  static destroy () {
    console.info("Destroy Called");
  }
  
  /**
   * Cache the current view settings
   */
  cacheView () {
    this.viewCache = {
      scale      : this.scale,
      translation: this.translation.slice()
    };
  }
  
  /**
   * Restore the cached view settings
   */
  restoreCachedView (duration, callback) {
    if (this.viewCache) {
      this.scaleAndTranslate(this.viewCache.scale, this.viewCache.translation, duration, callback);
      delete this.viewCache;
    }
  }
  
  /**
   * Convert screen coordinates into local coordinates for the globalLayer
   * @param point
   * @returns {*}
   */
  screenToLocalCoordinates (point) {
    var p = _.clone(point);
    
    if (p.x != null) {
      p.x = (p.x - this.translation[ 0 ]) / this.scale;
    }
    
    if (p.y != null) {
      p.y = (p.y - this.translation[ 1 ]) / this.scale;
    }
    
    if (p.width != null) {
      p.width = p.width / this.scale;
    }
    
    if (p.height != null) {
      p.height = p.height / this.scale;
    }
    
    return p;
  }
  
  /**
   * Convert local coordinates for the globalLayer into screen coordinates
   * @param point
   * @returns {*}
   */
  localToScreenCoordinates (point) {
    var p = _.clone(point);
    
    if (p.x != null) {
      p.x = this.translation[ 0 ] + p.x * this.scale;
    }
    
    if (p.y != null) {
      p.y = this.translation[ 1 ] + p.y * this.scale;
    }
    
    if (p.width != null) {
      p.width = p.width * this.scale;
    }
    
    if (p.height != null) {
      p.height = p.height * this.scale;
    }
    
    return p;
  }
  
  /**
   * Scale and translate the global layer in order to fit a rect on the page
   * @param rect
   * @param duration
   * @param callback
   */
  fitAndCenter (rect, duration, callback) {
    //console.debug("Fit and center");
    
    // default duration
    duration = duration == null ? this.config.viewTransitionTime : duration;
    
    var self          = this,
        margin        = DocTreeConfig.tree.highlightSurroundMargin / 2,
        contentWindow = {
          x     : margin,
          y     : margin,
          width : self.width - 2 * margin,
          height: self.height - 2 * margin
        },
        scale         = Math.min(
            contentWindow.width / rect.width,
            contentWindow.height / rect.height
        ),
        translation;
    
    // calculate the horizontal centering
    translation = [
      contentWindow.x - rect.x * scale + (contentWindow.width - rect.width * scale) / 2,
      contentWindow.y - rect.y * scale + (contentWindow.height - rect.height * scale) / 2
    ];
    
    // apply the scale and translation
    self.scaleAndTranslate(scale, translation, duration, callback);
  }
  
  /**
   * Zoom and translate the global layer in order to center a rect on the page
   * @param rect
   * @param scale
   * @param duration
   * @param callback
   */
  zoomAndCenter (rect, scale, duration, callback) {
    //console.debug("Zoom and center");
    
    // default duration
    duration = duration == null ? this.config.viewTransitionTime : duration;
    
    // default max scale
    scale = scale || 1;
    
    var self          = this,
        margin        = DocTreeConfig.tree.highlightSurroundMargin / 2,
        contentWindow = {
          x     : margin,
          y     : margin,
          width : self.width - 2 * margin,
          height: self.height - 2 * margin
        },
        translation;
    
    // calculate the horizontal centering
    translation = [
      contentWindow.x - rect.x * scale + (contentWindow.width - rect.width * scale) / 2,
      contentWindow.y - rect.y * scale + (contentWindow.height - rect.height * scale) / 2
    ];
    
    // apply the scale and translation
    self.scaleAndTranslate(scale, translation, duration, callback);
  }
  
  /**
   * Scale and translate the content layers
   * @param scale
   * @param translation
   * @param callback // callback function to call once the transition is complete
   * @param duration // the duration of the transition animation
   */
  scaleAndTranslate (scale, translation, duration, callback) {
    var self = this;
    
    // normalize
    translation[ 0 ] = translation[ 0 ] || 0;
    translation[ 1 ] = translation[ 1 ] || 0;
    scale            = scale || 1;
    
    // enact a floor on the y translation
    translation[ 1 ] = translation[ 1 ] > 0 ? 0 : translation[ 1 ];
    
    // update the internal accounting
    self.scale       = scale;
    self.translation = translation;
    self.zoomer.scale(scale);
    self.zoomer.translate(translation);
    
    //console.debug("scale: ", scale);
    //console.debug("translation: ", translation);
    Session.set("viewState", {
      scale      : self.scale,
      translation: self.translation.slice()
    });
    
    if (duration !== undefined) {
      self.layoutRoot.select(".global-layer")
          .transition()
          //.ease("linear")
          .ease("sin")
          .duration(duration)
          .attr("transform", "translate(" + self.translation + ") scale(" + self.scale + ")")
          .each("end", _.once(function () {
            if (typeof callback === "function") {
              callback();
            }
          }));
      
    } else {
      self.layoutRoot.select(".global-layer")
          .attr("transform", "translate(" + self.translation + ") scale(" + self.scale + ")");
      
      if (typeof callback === "function") {
        callback();
      }
    }
  }
  
  /**
   * Zoom and center a single node with a highlight circle
   * @param node
   * @param scale
   * @param callback
   */
  centerNode (node, scale, callback) {
    var self = this;
    
    // look up the node
    if (_.isString(node)) {
      node = self.nodeHandler.getByStaticId(node);
      if (!node) {
        console.error("centerNode: failed to find node by static id");
        return;
      }
    }
    
    // hide the location unknown
    self.hideLocationUnknown();
    
    // highlight this node
    var radius = Math.sqrt(Math.pow(node.icon.right, 2) + Math.pow(node.icon.bottom, 2)) + 10;
    self.highlightCircle
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", radius)
        .classed("hide", false);
    
    // get the bounds of the nodes
    var bounds = TreeUtils.nodeListBounds([ node ], this.config.highlightSurroundMargin);
    
    // make sure the bounds are up-to-date
    self.updateSize();
    
    // center the content and fit it on screen
    this.zoomAndCenter(bounds, scale, null, function () {
      if (callback) {
        callback.call(this);
      }
    }.bind(this));
  }
  
  /**
   * Clear the centered node
   */
  clearCenteredNode (callback) {
    var self = this;
    console.log("clearCenteredNode");
    
    self.highlightCircle
        .classed("hide", true);
    
    if (callback) {
      callback.call(this);
    }
  }
  
  /**
   * Zoom out to show everything
   */
  zoomAll (duration, callback) {
    var self = this;
    
    if (!self.contentBounds) {
      self.updateContentBounds();
    }
    
    var rect = {
      x     : self.contentBounds.left,
      y     : self.contentBounds.top,
      width : self.contentBounds.right - self.contentBounds.left,
      height: self.contentBounds.bottom - self.contentBounds.top
    };
    
    // make sure the bounds are up-to-date
    self.updateSize();
    
    // center
    self.fitAndCenter(rect, duration, function () {
      if (callback) {
        callback();
      }
    })
  }
  
  /**
   * Transition to a new view size while maintaining a centered & fit rect
   */
  transitionView (rect, finalWidth, finalHeight, duration, callback) {
    var self          = this,
        margin        = DocTreeConfig.tree.highlightSurroundMargin / 2,
        contentWindow = {
          x     : margin,
          y     : margin,
          width : finalWidth - 2 * margin,
          height: finalHeight - 2 * margin
        },
        scale         = Math.min(
            contentWindow.width / rect.width,
            contentWindow.height / rect.height
        ),
        translation;
    
    // calculate the horizontal centering
    translation = [
      contentWindow.x - rect.x * scale + (contentWindow.width - rect.width * scale) / 2,
      contentWindow.y - rect.y * scale + (contentWindow.height - rect.height * scale) / 2
    ];
    
    // apply the scale and translation
    self.scaleAndTranslate(scale, translation, duration, callback);
  }
  
  /**
   * Maintain the zoomAll view through a size transition
   */
  transitionZoomAll (finalWidth, finalHeight, duration, callback) {
    var self = this,
        rect = {
          x     : self.contentBounds.left,
          y     : self.contentBounds.top,
          width : self.contentBounds.right - self.contentBounds.left,
          height: self.contentBounds.bottom - self.contentBounds.top
        };
    self.transitionView(rect, finalWidth, finalHeight, duration, callback);
  }
  
  /**
   * Show the location unknown content
   */
  showLocationUnknown () {
    var self = this;
    self.layoutRoot.select(".location-unknown").classed("show", true);
  }
  
  /**
   * Show the location unknown content
   */
  hideLocationUnknown () {
    var self = this;
    self.layoutRoot.select(".location-unknown").classed("show", false);
  }
  
  /**
   * Show the actions for a node
   * @param node
   */
  showNodeActions (node) {
    var self = this;
    
    // look up the node
    if (_.isString(node)) {
      node = self.nodeHandler.getByStaticId(node);
      if (!node) {
        console.error("centerNode: failed to find node by static id");
        return;
      }
    }
    
    self.actionHandler.visibleActionList = [ node._id ];
    self.actionHandler.updateActionDisplay();
  }
  
  /**
   * Filter click events so as to not fire a click if it's really a double click
   * @param d
   */
  nodeClickFilter (d) {
    // check to see if there is a recent click event that could be part of a double
    var self  = this,
        event = d3.event,
        now   = Date.now();
    
    if (event.type.toLowerCase() === "dblclick") {
      // cancel the timeout that will fire the click event
      Meteor.clearTimeout(self.clickEvent.timeout);
      
      // fire the double click handler
      self.nodeDblClickHandler(event, d);
    } else {
      // clear any existing click timeout
      if (self.clickEvent && self.clickEvent.timeout) {
        Meteor.clearTimeout(self.clickEvent.timeout);
      }
      
      // set a timeout to allow for a double-click
      self.clickEvent = {
        timeStamp: now,
        target   : event.target,
        timeout  : Meteor.setTimeout(function () {
          this.nodeClickHandler(event, d);
        }.bind(self), self.config.dblClickTimeout)
      };
    }
  }
  
  /**
   * Front line event handler for clicks on nodes
   */
  nodeClickHandler (e, d) {
    var self = this;
    
    console.debug('click: ' + d._id + " (" + d.title + ")");
    
    // fetch the node fresh, sometimes the click events get stale data
    var node       = self.nodeHandler.getNode(d._id),
        nodeSelect = self.layoutRoot.select("#node_" + d._id + " .node");
    
    //console.debug(node);
    if (e.shiftKey) {
      
    } else if (e.altKey) {
      
    } else {
      
    }
  }
  
  /**
   * Front line event handler for double-clicks on nodes
   */
  nodeDblClickHandler (e, d) {
    console.debug('dblClick: ' + d._id + " (" + d.title + ")");
    var self = this,
        node = self.nodeHandler.getNode(d._id); // fetch the node fresh, sometimes the click events get stale data
    
    // Take the event out of circulation
    e.stopPropagation();
    
    // Toggle the node expansion
    if (node.childPages.length || node.childViews.length) {
      node.logExpanded = !node.logExpanded;
      if (node.childPages.length || node.childViews.length) {
        if (node.logExpanded) {
          console.debug('StartExpand');
          self.startExpand(node);
        } else {
          console.debug('StartCollapse');
          self.startCollapse(node);
        }
      }
    } else {
      console.debug('No children: ', node);
    }
  }
  
  /**
   * React to the cursor entering a node
   * @param d
   */
  nodeMouseEnterHandler (d) {
    var self = this;
    
    //console.debug("mouseenter: ", d);
    if (!self.state.inDrag) {
      // Make sure the node contols don't hide if they're visible for this node
      /*
       if(self.nodeControls.node && self.nodeControls.node._id == d._id){
       self.nodeControls.cancelHiding();
       }
       */
      
      // show the actions for this node
      /*
       self.showActionsTimeout = setTimeout(function () {
       self.actionHandler.visibleActionList = [d._id];
       self.actionHandler.updateActionDisplay();
       delete self.showActionsTimeout;
       }, 250);
       */
    }
  }
  
  /**
   * React to the cursor leaving a node
   * @param d
   */
  nodeMouseLeaveHandler (d) {
    var self = this;
    
    //console.debug("mouseleave: ", d);
    if (!self.state.inDrag) {
      // hide the node controls
      //self.nodeControls.considerHiding();
      
      // cancel the timer to show the controls if it exists
      /*
       if(self.showActionsTimeout){
       clearTimeout(self.showActionsTimeout);
       }
       */
    }
  }
  
  /**
   * Handle a click event on an action link or label
   * @param d
   */
  actionClickHandler (d) {
    var self  = this,
        event = d3.event;
    
    // Edit the action
    self.actionHandler.editAction(d);
  }
  
  /**
   * Handle a right-click event on an action link or label
   * @param d
   */
  actionRightClickHandler (d) {
    var self = this;
  }
  
  /**
   * React to the cursor entering an action
   * @param d
   */
  actionMouseEnterHandler (d) {
    //console.debug("Action mouseenter: ", d);
    var self = this;
    
    if (!self.state.inDrag) {
      // Show the hover state for this action
      self.actionHandler.hover(d, d3.event);
      
      // Show the action controls if hovered above a label
      if (d3.select(d3.event.target).classed("action-label")) {
        //console.log("Show action controls");
        //self.actionControls.show(d);
      }
    }
  }
  
  /**
   * React to the cursor leaving an action
   * @param d
   */
  actionMouseLeaveHandler (d) {
    //console.debug("Action mouseleave: ", d);
    var self = this;
    
    if (!self.state.inDrag) {
      // Consider hiding any hovered actions
      self.actionHandler.considerHiding();
      
      // Consider hiding the node controls
      //self.actionControls.considerHiding();
    }
  }
  
  /**
   * Recalculate the content bounds based on the root node
   */
  updateContentBounds () {
    // TODO: Make this work with multiple root nodes
    var rootNode = this.nodeHandler.getRootNodes()[ 0 ];
    
    if (rootNode !== undefined) {
      // initialize the bounds
      this.contentBounds = {
        top   : rootNode.family.top + rootNode.y,
        bottom: rootNode.family.bottom + rootNode.y,
        left  : rootNode.family.left + rootNode.x,
        right : rootNode.family.right + rootNode.x
      };
    }
  }
  
  /**
   * Update the tree layout
   * @param duration The duration of the update transition
   */
  update (duration) {
    var self = this;
    
    // default duration
    duration = duration || self.config.stepDuration;
    
    // prepare the data for the update
    self.prepData();
    
    // Update the nodes
    self.nodeHandler.update(duration);
    
    // Update the links
    self.linkHandler.update(duration);
    
    // Update the actions
    self.actionHandler.update(duration);
  }
  
  /**
   * Highlight a list of nodes
   * @param nodeIdList The list of node staticIds to highlight
   */
  highlightNodes (nodeIdList) {
    var self     = this,
        nodeList = [], nodes;
    
    //console.log("highlightNodes, nodeIdList: ", nodeIdList);
    
    _.each(nodeIdList, function (node) {
      if (_.isObject(node)) {
        nodeList.push(self.nodeHandler.getByStaticId(node.staticId));
      } else {
        nodeList.push(self.nodeHandler.getByStaticId(node));
      }
    });
    
    //console.log("highlightNodes, nodeList: ", nodeList);
    
    nodes = self.highlightLayer.selectAll(".node-highlight")
        .data(nodeList, function (d) {
          return d._id;
        });
    
    nodes.enter()
        .append("circle")
        .attr("class", "node-highlight node-controls-back")
        .attr("cx", function (d) {
          return d.x
        })
        .attr("cy", function (d) {
          return d.y
        })
        .attr("r", function (d) {
          return Math.sqrt(Math.pow(d.icon.right, 2) + Math.pow(d.icon.bottom, 2)) + 10
        });
    
    nodes
        .attr("cx", function (d) {
          return d.x
        })
        .attr("cy", function (d) {
          return d.y
        })
        .attr("r", function (d) {
          return Math.sqrt(Math.pow(d.icon.right, 2) + Math.pow(d.icon.bottom, 2)) + 10
        });
    
    nodes.exit().remove();
  }
  
  /**
   * Clear the highlight
   */
  clearHighlight () {
    var self = this;
    
    self.highlightLayer.selectAll(".node-highlight").remove();
  }
}
