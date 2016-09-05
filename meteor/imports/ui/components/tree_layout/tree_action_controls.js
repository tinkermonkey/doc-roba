import {DocTreeConfig} from '../../lib/doc_tree/doc_tree_config.js';
import {TreeUtils} from './tree_utils.js';
/**
 * Hover controls for working with nodes
 *
 * @param treeLayout
 * @param config
 * @constructor
 */
export default class TreeActionControls {
  constructor(treeLayout, config) {
    var self = this;
    
    // Make sure there's a tree layout
    if (!treeLayout) {
      console.error("TreeActionControls constructor failed: no TreeLayout passed");
      return;
    }
    self.treeLayout = treeLayout;
    
    // condense the config
    self.config = config || {};
    _.defaults(self.config, DocTreeConfig.nodeControls);
    
    // pick up the layers we need
    self.backLayer = self.treeLayout.layoutRoot.select(".action-controls-layer-back");
    self.frontLayer = self.treeLayout.layoutRoot.select(".action-controls-layer-front");
    
    // create a drag listener for creating links between nodes
    self.addActionDragger = d3.behavior.drag()
        .on("dragstart", self.addActionDragStart.bind(self))
        .on("drag", self.addActionDrag.bind(self))
        .on("dragend", self.addActionDragEnd.bind(self));
    
    // create a flag to use to lock the controls
    self.locked = false;
  }
  
  /**
   * Initialize the controls
   */
  init() {
    //console.debug("actionControls.init()");
    var self = this;
    
    // clear out the layer
    self.backLayer.selectAll("*").remove();
    self.frontLayer.selectAll("*").remove();
    self.create();
    self.hide();
  }
  
  /**
   * Lock the controls so they do not change
   */
  lock() {
    //console.debug("ActionControls: lock");
    this.locked = true;
  }
  
  /**
   * Unlock the controls so they can change
   */
  unlock() {
    //console.debug("ActionControls: unlock");
    this.locked = false;
  }
  
  /**
   * Create the controls
   */
  create() {
    //console.debug("ActionControls.create()");
    var self = this,
        tree = self.treeLayout;
    
    // The base element for controls behind the nodes
    self.controlsBack = self.backLayer
        .append("g")
        .attr("transform", "translate(0,0)")
        .on('mouseenter', function () {
          self.cancelHiding();
        })
        .on('mouseleave', function () {
          self.considerHiding();
        });
    
    // The base element for controls in front of the nodes
    self.controlsFront = self.frontLayer
        .append("g")
        .attr("transform", "translate(0,0)")
        .classed("no-mouse", true);
    
    self.background = self.controlsBack
        .append("circle")
        .attr("class", "node-controls-back")
        .attr("r", 0)
        .attr("cx", 0)
        .attr("cy", 0);
    
    // Setup the Add Action link dragger
    self.addActionDragHandle = self.controlsBack
        .append("g")
        .call(self.addActionDragger)
        .attr("class", "add-action-dragger control-button")
        .attr("transform", "translate(0, 0)");
    
    self.addActionDragHandle.append("path")
        .attr("class", "drag-tether no-mouse")
        .attr("d", "M0,0");
    
    self.addActionDragHandle.append("path")
        .attr("class", "dragger")
        .attr("d", self.treeLayout.nodeControls.generateDraggerOutline())
        .on('mouseenter', function () {
          this.addActionDragHandleDummy.classed("inDrag", true);
        }.bind(this))
        .on('mouseleave', function () {
          if (!this.treeLayout.state.inDrag) {
            this.addActionDragHandleDummy.classed("inDrag", false);
          }
        }.bind(this));
    
    // Setup the dummy dragger which in visually in front of the nodes
    self.addActionDragHandleDummy = self.controlsFront
        .append("g")
        .attr("class", "add-action-dragger control-button")
        .attr("transform", "translate(0, 0)");
    
    self.addActionDragHandleDummy.append("path")
        .attr("class", "drag-tether drag-tether-front no-mouse")
        .attr("d", "M0,0");
    
    self.addActionDragHandleDummy.append("path")
        .attr("class", "dragger")
        .attr("d", self.treeLayout.nodeControls.generateDraggerOutline());
  }
  
  /**
   * Update the location of the controls
   */
  update(duration) {
    //console.debug("ActionControls.update()");
    var self = this;
    
    // default duration
    if (parseInt(duration) == NaN) {
      duration = self.config.transitionTimer;
    }
    
    if (self.action) {
      var radius = self.getRadius(self.action),
          visible = self.background.attr("r") > radius / 2,
          placement = TreeUtils.parseTranslate(self.controlsBack.attr("transform"));
      
      // show the control layer
      self.backLayer
          .attr("visibility", "visible")
          .attr("opacity", 1);
      
      self.frontLayer
          .attr("visibility", "visible")
          .attr("opacity", 1);
      
      if (duration && visible && placement && (placement.xInt != self.action.x || placement.yInt != self.action.y)) {
        // Glide the controls into place if they're visible
        self.controlsBack
            .transition()
            .duration(duration)
            .attr("transform", "translate(" + self.action.x + ", " + self.action.y + ")");
        
        self.controlsFront
            .transition()
            .duration(duration)
            .attr("transform", "translate(" + self.action.x + ", " + self.action.y + ")");
        
        // adjust the node control background
        self.background
            .transition()
            .duration(duration * 0.66)
            .attr("r", radius * 0.75)
            .transition()
            .duration(duration * 0.66)
            .attr("r", radius);
        
        self.addActionDragHandle
            .transition()
            .duration(duration * 0.66)
            .attr("transform", "translate(" + (radius * 0.75 * Math.cos(Math.PI / 4)) + ", " + (radius * 0.75 * Math.sin(Math.PI / 4)) + ")")
            .transition()
            .duration(duration * 0.66)
            .attr("transform", "translate(" + (radius * Math.cos(Math.PI / 4)) + ", " + (radius * Math.sin(Math.PI / 4)) + ")");
        
        self.addActionDragHandleDummy
            .attr("opacity", 0)
            .attr("transform", "translate(" + (radius * Math.cos(Math.PI / 4)) + ", " + (radius * Math.sin(Math.PI / 4)) + ")")
            .transition()
            .duration(duration * 0.66 * 2)
            .transition()
            .attr("opacity", 1);
        
      } else {
        // Get the controls placed correctly
        self.controlsBack
            .attr("transform", "translate(" + self.action.x + ", " + self.action.y + ")");
        self.controlsFront
            .attr("transform", "translate(" + self.action.x + ", " + self.action.y + ")");
        
        // adjust the node control background
        self.background
            .transition()
            .duration(duration)
            .attr("r", radius);
        
        self.addActionDragHandle
            .transition()
            .duration(duration)
            .attr("transform", "translate(" + (radius * Math.cos(Math.PI / 4)) + ", " + radius * Math.sin(Math.PI / 4) + ")");
        
        self.addActionDragHandleDummy
            .attr("opacity", 0)
            .attr("transform", "translate(" + (radius * Math.cos(Math.PI / 4)) + ", " + radius * Math.sin(Math.PI / 4) + ")")
            .transition()
            .duration(duration)
            .transition()
            .attr("opacity", 1);
      }
      
      // Sometimes the transitions don't cancel out, check up and re-fire the update if we need to
      setTimeout(function () {
        if (self.background.attr("r") == 0) {
          console.log("Checkup failed, re-firing update");
          self.update();
        }
      }, 50);
    }
    
    // Update the node drop targets
    self.treeLayout.dropNodeHandler.update();
  }
  
  /**
   * Show the controls
   * @param d The node to control
   */
  show(d) {
    //console.debug("ActionControls.show()");
    var self = this;
    
    // make sure it's not locked
    if (self.locked) {
      return;
    }
    
    // store the node under control
    self.action = d;
    self.cancelHiding();
    
    // update the controls
    self.update();
  }
  
  /**
   * Hide the controls
   */
  hide(duration) {
    //console.debug("ActionControls.hide()");
    var self = this;
    visible = self.background.attr("r") > 0;
    
    // make sure it's not locked
    if (self.locked) {
      return;
    }
    
    // default duration
    if (parseInt(duration) == NaN) {
      duration = self.config.transitionTimer;
    }
    
    // Clear the node attachment
    delete self.action;
    
    if (visible) {
      self.background
          .transition()
          .duration(duration)
          .attr("r", 0);
      
      self.addActionDragHandle
          .transition()
          .duration(duration)
          .attr("transform", "translate(0,0)")
          .each("end", function () {
            //console.log("Hide node controls complete");
            if (!self.controlledNode) {
              //console.log("Firing end event to hid the controls layer");
              self.backLayer
                  .attr("opacity", 0)
                  .attr("visibility", "hidden");
              self.frontLayer
                  .attr("opacity", 0)
                  .attr("visibility", "hidden");
            }
          });
      
      self.addActionDragHandleDummy
          .attr("opacity", 0);
    } else {
      self.background
          .attr("r", 0);
      
      self.addActionDragHandle
          .attr("transform", "translate(0,0)");
      
      self.addActionDragHandleDummy
          .attr("opacity", 0);
      
      self.backLayer
          .attr("opacity", 0)
          .attr("visibility", "hidden");
      
      self.frontLayer
          .attr("opacity", 0)
          .attr("visibility", "hidden");
    }
    
  }
  
  /**
   * Possibly hide the controls
   */
  considerHiding() {
    //console.debug("ActionControls.considerHiding()");
    var self = this,
        tree = this.treeLayout;
    
    if (self.hideTimeout) {
      clearTimeout(self.hideTimeout);
    }
    
    self.hideTimeout = setTimeout(function () {
      if (!tree.state.inDrag) {
        self.hide();
      }
    }, self.config.hideTimer);
    
  }
  
  /**
   * Stop hiding the controls
   */
  cancelHiding() {
    //console.debug("ActionControls.cancelHiding()");
    var self = this;
    
    if (self.hideTimeout) {
      clearTimeout(self.hideTimeout);
    }
  }
  
  /**
   * Calculate the radius of the controls for a node
   * @param d
   */
  getRadius(d) {
    return Math.sqrt(Math.pow(d.labelWidth, 2) + Math.pow(d.labelHeight, 2)) / 2 + 6;
  }
  
  /**
   * Generate the tether path for the addActionDragHandle
   */
  generateDragTetherPath() {
    var self = this,
        d = self.action,
        path = 'M0,0',
        point,
        corner,
        tetherLength,
        ratio;
    
    if (d && d.drag && d.drag.x !== null) {
      tetherLength = self.backLayer.select(".drag-tether").node().getTotalLength();
      
      // Center point of the node being controlled
      point = {
        x: -1 * d.drag.x - d.drag.homeX,
        y: -1 * d.drag.y - d.drag.homeY + d.labelHeight / 2
      }
      corner = {
        x: point.x,
        y: point.y + Math.min(tetherLength * 0.5, 200)
      }
      path = "M" + point.x + " " + point.y + "Q" + corner.x + " " + corner.y + " 0 0";
    }
    
    return path;
  }
  
  /**
   * Handle the user pressing the escape key during a drag
   */
  dragEscapeHandler(e) {
    //console.debug("dragEscapeHandler: " + e.which);
    if (e.which == 27 && e.data) {
      e.data.addActionDragEnd();
    }
  }
  
  /**
   * Handle the start of an action creating drag
   */
  addActionDragStart() {
    //console.debug("ActionControls.addActionDragStart()");
    var self = this,
        tree = self.treeLayout,
        radius = self.getRadius(self.action);
    
    // diffuse the event so that we can hover through the dragged element
    d3.event.sourceEvent.stopPropagation();
    
    // Add an event listener to stop this if the user presses escape
    $("body").bind("keydown", self, self.dragEscapeHandler);
    
    // Show the drop layer
    tree.dropNodeHandler.show();
    
    // Add the drag style to the dragger
    self.addActionDragHandle.classed("inDrag", true);
    self.addActionDragHandleDummy.classed("inDrag", true).attr("opacity", 1);
    
    // Set the flag
    tree.state.inDrag = true;
    
    // Setup the drag construct
    self.action.drag = {
      el: self.addActionDragHandle,
      dummy: self.addActionDragHandleDummy,
      x: 0,
      y: 0,
      homeX: radius * Math.cos(Math.PI / 4),
      homeY: radius * Math.sin(Math.PI / 4)
    }
  }
  
  /**
   * Handle the continued dragging during an add-action operation
   */
  addActionDrag() {
    //console.debug("ActionControls.addActionDrag()");
    var self = this,
        d = self.action;
    
    // translate and draw the connector
    d.drag.x += d3.event.dx;
    d.drag.y += d3.event.dy;
    d.drag.el.attr("transform", "translate(" + (d.drag.homeX + d.drag.x) + ", " + (d.drag.homeY + d.drag.y) + ")");
    d.drag.dummy.attr("transform", "translate(" + (d.drag.homeX + d.drag.x) + ", " + (d.drag.homeY + d.drag.y) + ")");
    d.drag.el.select(".drag-tether").attr("d", self.generateDragTetherPath());
    d.drag.dummy.select(".drag-tether").attr("d", self.generateDragTetherPath());
  }
  
  /**
   * Handle the end of an add-action drag
   */
  addActionDragEnd() {
    //console.debug("ActionControls.addActionDragEnd()");
    var self = this,
        tree = self.treeLayout,
        d = self.action;
    
    // If the drag is aborted we need to exit early
    if (!d) {
      return;
    }
    
    // get the radius of the node
    var radius = self.getRadius(d);
    
    // Remove the escape handler
    $("body").unbind("keydown", self.dragEscapeHandler);
    
    // add an action if there was a connection made
    if (tree.dropNodeHandler.getNode()) {
      // add the record
      tree.actionHandler.addRoute(d.action, tree.dropNodeHandler.getNode());
      
      // show the actions for the source node
      tree.actionHandler.visibleActionList.push(d._id);
      
      // clear out the drop node
      tree.dropNodeHandler.clearNode();
    } else {
      console.info("DragEnd without drop target");
    }
    
    // now we're safe to say we're not in a drag event
    tree.state.inDrag = false;
    
    // hide the dropLayer elements
    tree.dropNodeHandler.hide();
    
    // enable pointer events on the drag circle
    self.addActionDragHandle.classed("inDrag", false);
    self.addActionDragHandleDummy.classed("inDrag", false);
    d.drag.dummy.attr("opacity", 0);
    
    // clear out the path and return to home
    d.drag.el.select(".drag-tether").attr("d", "M0,0");
    d.drag.dummy.select(".drag-tether").attr("d", "M0,0");
    d.drag.el.transition()
        .duration(120)
        .attr("transform", "translate(" + (radius * Math.cos(Math.PI / 4)) + ", " + (radius * Math.sin(Math.PI / 4)) + ")")
        .transition()
        .attr("style", "")
        .each("end", _.once(function () {
          // get rid of the drag construct
          try {
            delete self.action.drag;
          } catch (e) {
            console.error("DragEnd Error: " + e);
          }
          
          // ask to hide the node controls
          self.update();
          self.considerHiding();
        }));
  }
  
  /**
   * Return the controls attach point for the popover
   */
  attachPoint() {
    return $(".action-controls-layer-back").get(0);
  }
};
