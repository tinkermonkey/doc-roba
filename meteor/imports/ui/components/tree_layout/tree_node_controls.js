import {DocTreeConfig} from '../../lib/doc_tree/doc_tree_config.js';
import {TreeUtils} from './tree_utils.js';
import {RobaRouter} from '../../../api/roba_router/roba_router.js';
import {NodeTypes} from '../../../api/node/node_types.js';

/**
 * Hover controls for working with nodes
 *
 * @param treeLayout
 * @param config
 * @constructor
 */
export default class TreeNodeControls {
  
  constructor(treeLayout, config) {
    var self = this;
    
    // Make sure there's a tree layout
    if (!treeLayout) {
      console.error("TreeNodeControls constructor failed: no TreeLayout passed");
      return;
    }
    self.treeLayout = treeLayout;
    
    // condense the config
    self.config = config || {};
    _.defaults(self.config, DocTreeConfig.nodeControls);
    
    // pick up the layers we need
    self.midLayer = self.treeLayout.layoutRoot.select(".node-controls-layer");
    self.backLayer = self.treeLayout.layoutRoot.select(".node-controls-layer-back");
    self.frontLayer = self.treeLayout.layoutRoot.select(".node-controls-layer-front");
    
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
    console.debug("nodeControls.init()");
    var self = this;
    
    // clear out the layer
    self.midLayer.selectAll("*").remove();
    self.backLayer.selectAll("*").remove();
    self.frontLayer.selectAll("*").remove();
    self.create();
    self.hide();
  }
  
  /**
   * Lock the controls so they do not change
   */
  lock() {
    console.debug("NodeControls: lock");
    this.locked = true;
  }
  
  /**
   * Unlock the controls so they can change
   */
  unlock() {
    console.debug("NodeControls: unlock");
    this.locked = false;
  }
  
  /**
   * Create the controls
   */
  create() {
    console.debug("nodeControls.create()");
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
    
    // The middle layer for controls in front of the nodes
    self.controlsMid = self.midLayer
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
    
    // provide some hover protection with an invisible shield
    self.shield = self.controlsBack
        .append("circle")
        .attr("class", "node-controls-shield")
        .attr("r", 0)
        .attr("cx", 0)
        .attr("cy", 0);
    
    self.background = self.controlsBack
        .append("circle")
        .attr("class", "node-controls-back")
        .attr("r", 0)
        .attr("cx", 0)
        .attr("cy", 0);
    
    // Node add child node button
    self.addDownButton = self.controlsMid
        .append("g")
        .attr("class", "add-down-button control-button add-page-button")
        .attr("transform", "translate(0, 0)")
        .on('click', function () {
          tree.nodeHandler.addNode(self.node, "down");
        });
    
    self.addDownButton.append("circle")
        .attr("class", "control-back")
        .attr("r", "15")
        .attr("cx", "0")
        .attr("cy", "0");
    
    self.addDownButton.append("text")
        .attr("x", 0)
        .attr("y", 6)
        .attr("class", "no-select-complete")
        .text("+");
    
    // Node add view button
    self.addRightButton = self.controlsMid
        .append("g")
        .attr("class", "add-right-button control-button add-view-button")
        .attr("transform", "translate(0, 0)")
        .on('click', function () {
          tree.nodeHandler.addNode(self.node, "right");
        });
    
    self.addRightButton.append("circle")
        .attr("class", "control-back")
        .attr("r", "15")
        .attr("cx", "0")
        .attr("cy", "0");
    
    self.addRightButton.append("text")
        .attr("x", 0)
        .attr("y", 6)
        .attr("class", "no-select-complete")
        .text("+");
    
    // Node add navMenu button
    self.addNavButton = self.controlsMid
        .append("g")
        .attr("class", "add-right-button control-button add-navMenu-button")
        .attr("transform", "translate(0, 0)")
        .on('click', function () {
          tree.nodeHandler.addNode(self.node, "nav");
        });
    
    self.addNavButton.append("circle")
        .attr("class", "control-back")
        .attr("r", "15")
        .attr("cx", "0")
        .attr("cy", "0");
    
    self.addNavButton.append("text")
        .attr("x", 0)
        .attr("y", 6)
        .attr("class", "no-select-complete")
        .text("+");
    //.text("\u276F");
    
    // Node Edit button
    self.editButton = self.controlsMid
        .append("g")
        .attr("class", "edit-button control-button")
        .attr("transform", "translate(0, 0)")
        .on('click', function () {
          tree.nodeHandler.editNode(self.node);
        });
    
    self.editButton.append("circle")
        .attr("class", "control-back")
        .attr("r", "15")
        .attr("cx", "0")
        .attr("cy", "0");
    
    self.editButton.append("text")
        .attr("x", 0)
        .attr("y", 8)
        .attr("class", "no-select-complete")
        .text("\u270E");
    
    // Node Roba button
    self.robaButton = self.controlsMid
        .append("g")
        .attr("class", "roba-button control-button")
        .attr("transform", "translate(0, 0)")
        .on('click', function (d) {
          tree.popover([self.node], {
                contentTemplate: 'roba_launcher',
                contentData: new RobaContext({
                  route: RobaRouter.routeFromStart(self.node._id)
                })
              },
              tree.nodeControls
          );
        });
    
    self.robaButton.append("circle")
        .attr("class", "control-back")
        .attr("r", "15")
        .attr("cx", "0")
        .attr("cy", "0");
    
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
        .attr("d", self.generateDraggerOutline())
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
        .attr("d", self.generateDraggerOutline());
  }
  
  /**
   * Update the location of the controls
   */
  update() {
    //console.debug("nodeControls.update()");
    var self = this,
        tree = self.treeLayout,
        contraction = 0.75,
        duration = self.config.transitionTimer,
        _45Deg = Math.cos(Math.PI / 4),
        x, y;
    
    if (self.node) {
      var radius = self.getRadius(self.node),
          visible = self.background.attr("r") > radius / 2,
          placement = TreeUtils.parseTranslate(self.controlsBack.attr("transform"));
      
      // show the control layer
      self.midLayer
          .attr("visibility", "visible")
          .attr("opacity", 1);
      
      self.backLayer
          .attr("visibility", "visible")
          .attr("opacity", 1);
      
      self.frontLayer
          .attr("visibility", "visible")
          .attr("opacity", 1);
      
      if (visible && placement && (placement.xInt != self.node.x || placement.yInt != self.node.y)) {
        // quick transition
        duration = self.config.transitionTimer * 0.66;
        
        // Glide the controls into place if they're visible
        self.controlsBack
            .transition()
            .duration(240)
            .attr("transform", "translate(" + self.node.x + ", " + self.node.y + ")");
        
        self.controlsMid
            .transition()
            .duration(240)
            .attr("transform", "translate(" + self.node.x + ", " + self.node.y + ")");
        
        self.controlsFront
            .transition()
            .duration(240)
            .attr("transform", "translate(" + self.node.x + ", " + self.node.y + ")");
        
        // adjust the shield
        self.shield
            .attr("r", radius + 20);
        
        // adjust the node control background
        self.background
            .transition()
            .duration(duration)
            .attr("r", radius * contraction)
            .transition()
            .duration(duration)
            .attr("r", radius);
        
        // Adjust the placement of all of the controls to fit this node
        self.addDownButton
            .transition()
            .duration(duration)
            .attr("transform", "translate(0, " + (radius * contraction) + ")")
            .transition()
            .duration(duration)
            .attr("transform", "translate(0, " + (radius) + ")");
        
        self.addRightButton
            .transition()
            .duration(duration)
            .attr("transform", "translate(" + (radius * contraction) + ", 0)")
            .transition()
            .duration(duration)
            .attr("transform", "translate(" + (radius) + ", 0)");
        
        self.addNavButton
            .transition()
            .duration(duration)
            .attr("transform", "translate(" + (radius * contraction * _45Deg) + ", " + (-1 * radius * contraction * _45Deg) + ")")
            .transition()
            .duration(duration)
            .attr("transform", "translate(" + (radius * _45Deg) + ", " + (-1 * radius * _45Deg) + ")");
        
        self.editButton
            .transition()
            .duration(duration)
            .attr("transform", "translate(0, " + (-1 * radius * contraction) + ")")
            .transition()
            .duration(duration)
            .attr("transform", "translate(0, " + (-1 * radius) + ")");
        
        self.robaButton
            .transition()
            .duration(duration)
            .attr("transform", "translate(" + (-1 * radius * contraction * _45Deg) + ", " + (-1 * radius * contraction * _45Deg) + ")")
            .transition()
            .duration(duration)
            .attr("transform", "translate(" + (-1 * radius * _45Deg) + ", " + (-1 * radius * _45Deg) + ")");
        
        self.addActionDragHandle
            .transition()
            .duration(duration)
            .attr("transform", "translate(" + (radius * contraction * _45Deg) + ", " + (radius * contraction * _45Deg) + ")")
            .transition()
            .duration(duration)
            .attr("transform", "translate(" + (radius * _45Deg) + ", " + (radius * _45Deg) + ")");
        
        self.addActionDragHandleDummy
            .attr("opacity", 0)
            .attr("transform", "translate(" + (radius * _45Deg) + ", " + (radius * _45Deg) + ")")
            .transition()
            .duration(duration * 2)
            .transition()
            .attr("opacity", 1);
        
      } else {
        // Get the controls placed correctly
        self.controlsBack
            .attr("transform", "translate(" + self.node.x + ", " + self.node.y + ")");
        self.controlsMid
            .attr("transform", "translate(" + self.node.x + ", " + self.node.y + ")");
        self.controlsFront
            .attr("transform", "translate(" + self.node.x + ", " + self.node.y + ")");
        
        // adjust the shield
        self.shield
            .attr("r", radius + 20);
        
        // adjust the node control background
        self.background
            .transition()
            .duration(self.config.transitionTimer)
            .attr("r", radius);
        
        // Adjust the placement of all of the controls to fit this node
        self.addDownButton
            .transition()
            .duration(self.config.transitionTimer)
            .attr("transform", "translate(0, " + (radius) + ")");
        
        self.addRightButton
            .transition()
            .duration(self.config.transitionTimer)
            .attr("transform", "translate(" + (radius) + ", 0)");
        
        self.addNavButton
            .transition()
            .duration(self.config.transitionTimer)
            .attr("transform", "translate(" + (radius * _45Deg) + ", " + (-1 * radius * _45Deg) + ")");
        
        self.editButton
            .transition()
            .duration(self.config.transitionTimer)
            .attr("transform", "translate(0, " + (-1 * radius) + ")");
        
        self.robaButton
            .transition()
            .duration(self.config.transitionTimer)
            .attr("transform", "translate(" + (-1 * radius * _45Deg) + ", " + (-1 * radius * _45Deg) + ")");
        
        self.addActionDragHandle
            .transition()
            .duration(self.config.transitionTimer)
            .attr("transform", "translate(" + (radius * _45Deg) + ", " + radius * _45Deg + ")");
        
        self.addActionDragHandleDummy
            .attr("opacity", 0)
            .attr("transform", "translate(" + (radius * _45Deg) + ", " + radius * _45Deg + ")")
            .transition()
            .duration(self.config.transitionTimer)
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
    tree.dropNodeHandler.update();
  }
  
  /**
   * Show the controls
   * @param d The node to control
   */
  show(d) {
    //console.debug("nodeControls.show()");
    var self = this;
    
    // make sure it's not locked
    if (self.locked) {
      return;
    }
    
    // store the node under control
    self.node = d;
    self.cancelHiding();
    
    // hide pieces base on the type of node
    switch (self.node.type) {
      case NodeTypes.page:
      case NodeTypes.view:
        self.addRightButton.attr("display", "");
        self.addNavButton.attr("display", "");
        self.addActionDragHandle.attr("display", "");
        self.addActionDragHandleDummy.attr("display", "");
        self.robaButton.attr("display", "");
        self.addDownButton.attr("display", "");
        break;
      case NodeTypes.platform:
        self.addRightButton.attr("display", "none");
        self.addNavButton.attr("display", "none");
        self.addActionDragHandle.attr("display", "none");
        self.addActionDragHandleDummy.attr("display", "none");
        self.robaButton.attr("display", "none");
        self.addDownButton.attr("display", "");
        break;
      case NodeTypes.navMenu:
        self.addRightButton.attr("display", "none");
        self.addNavButton.attr("display", "none");
        self.addActionDragHandle.attr("display", "");
        self.addActionDragHandleDummy.attr("display", "");
        self.robaButton.attr("display", "none");
        self.addDownButton.attr("display", "none");
        break;
      case NodeTypes.email:
        self.addRightButton.attr("display", "none");
        self.addNavButton.attr("display", "none");
        self.addActionDragHandle.attr("display", "none");
        self.addActionDragHandleDummy.attr("display", "none");
        self.robaButton.attr("display", "none");
        self.addDownButton.attr("display", "none");
        break;
      default:
        self.addRightButton.attr("display", "none");
        self.addNavButton.attr("display", "none");
        self.addActionDragHandle.attr("display", "none");
        self.addActionDragHandleDummy.attr("display", "none");
        self.robaButton.attr("display", "none");
        self.addDownButton.attr("display", "");
    }
    
    // update the controls
    self.update();
  }
  
  /**
   * Hide the controls
   */
  hide() {
    //console.debug("nodeControls.hide()");
    var self = this,
        visible = self.background.attr("r") > 0;
    
    // make sure it's not locked
    if (self.locked) {
      return;
    }
    
    // Clear the node attachment
    delete self.node;
    
    // shield doesn't need to be animated
    self.shield
        .attr("r", 0);
    
    if (visible) {
      self.background
          .transition()
          .duration(self.config.transitionTimer)
          .attr("r", 0);
      
      self.addDownButton
          .transition()
          .duration(self.config.transitionTimer)
          .attr("transform", "translate(0, 0)");
      
      self.addRightButton
          .transition()
          .duration(self.config.transitionTimer)
          .attr("transform", "translate(0, 0)");
      
      self.addNavButton
          .transition()
          .duration(self.config.transitionTimer)
          .attr("transform", "translate(0, 0)");
      
      self.editButton
          .transition()
          .duration(self.config.transitionTimer)
          .attr("transform", "translate(0, 0)");
      
      self.robaButton
          .transition()
          .duration(self.config.transitionTimer)
          .attr("transform", "translate(0, 0)");
      
      self.addActionDragHandle
          .transition()
          .duration(self.config.transitionTimer)
          .attr("transform", "translate(0,0)")
          .each("end", function () {
            //console.log("Hide node controls complete");
            if (!self.controlledNode) {
              //console.log("Firing end event to hid the controls layer");
              self.midLayer
                  .attr("opacity", 0)
                  .attr("visibility", "hidden");
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
      
      self.addDownButton
          .attr("transform", "translate(0, 0)");
      
      self.addRightButton
          .attr("transform", "translate(0, 0)");
      
      self.editButton
          .attr("transform", "translate(0, 0)");
      
      self.robaButton
          .attr("transform", "translate(0, 0)");
      
      self.addActionDragHandle
          .attr("transform", "translate(0,0)");
      
      self.addActionDragHandleDummy
          .attr("opacity", 0);
      
      self.midLayer
          .attr("opacity", 0)
          .attr("visibility", "hidden");
      
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
    //console.debug("nodeControls.considerHiding()");
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
    //console.debug("nodeControls.cancelHiding()");
    var self = this;
    
    if (self.hideTimeout) {
      clearTimeout(self.hideTimeout);
    }
  }
  
  /**
   * Calculate the radius of the controls for a node
   * @param d
   */
  static getRadius(d) {
    return Math.sqrt(Math.pow(d.icon.right, 2) + Math.pow(d.icon.bottom, 2)) + 15;
  }
  
  /**
   * Generate the outline path for the addActionDragHandle
   * This changes from a circle to a balloon shape when pulled
   */
  generateDraggerOutline() {
    var self = this,
        tree = self.treeLayout,
        d = self.node;
    
    var path = 'M0 10 A10 10, 0, 1, 1, 1, 10 Z',
        radius = 10,
        boxRadius = Math.sqrt(Math.pow(radius, 2) * 2) * 2,
        tailAngle = Math.PI / 3,
        ovation = Math.PI / 15,
        tether,
        tetherLength,
        tetherAngle,
        pointA,
        pointB,
        pointC,
        pointD,
        pointE,
        pointF,
        cornerLength;
    
    if (d && d.drag && 0) {
      tether = self.backLayer.select(".drag-tether").node();
      tetherLength = tether.getTotalLength();
      cornerLength = Math.sqrt(Math.pow(d.icon.right, 2) + Math.pow(d.icon.bottom, 2)) + 15;
      
      if (tetherLength > cornerLength + 3) {
        // Get the target attache point
        pointA = tether.getPointAtLength(tetherLength - radius * 2);
        pointB = tether.getPointAtLength(tetherLength - radius * 1.3);
        
        // calculate the angle to the targeted tether point
        tetherAngle = Math.atan(pointA.y / pointA.x) + (pointA.x > 0 ? Math.PI : 0);
        
        // Get the top attach point
        pointC = {
          x: radius * Math.cos(tetherAngle - Math.PI / 2 - tailAngle),
          y: radius * Math.sin(tetherAngle - Math.PI / 2 - tailAngle)
        };
        
        // Get the bottom attach point
        pointD = {
          x: radius * Math.cos(tetherAngle + Math.PI / 2 + tailAngle),
          y: radius * Math.sin(tetherAngle + Math.PI / 2 + tailAngle)
        };
        
        // Get the top control point
        pointE = {
          x: boxRadius * Math.cos(tetherAngle - Math.PI / 4 - ovation),
          y: boxRadius * Math.sin(tetherAngle - Math.PI / 4 - ovation)
        };
        
        // Get the bottom control point
        pointF = {
          x: boxRadius * Math.cos(tetherAngle + Math.PI / 4 + ovation),
          y: boxRadius * Math.sin(tetherAngle + Math.PI / 4 + ovation)
        };
        
        path = "M" + pointA.x + " " + pointA.y +
            " Q" + pointB.x + " " + pointB.y + " " + pointC.x + " " + pointC.y +
            " C" + pointE.x + " " + pointE.y + " " + pointF.x + " " + pointF.y + " " + pointD.x + " " + pointD.y +
            " Q" + pointB.x + " " + pointB.y + " " + pointA.x + " " + pointA.y;
      }
    }
    return path;
  }
  
  /**
   * Generate the tether path for the addActionDragHandle
   */
  generateDragTetherPath() {
    var self = this,
        d = self.node,
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
        y: -1 * d.drag.y - d.drag.homeY + d.icon.bottom
      };
      corner = {
        x: point.x,
        y: point.y + Math.min(tetherLength * 0.5, 200)
      };
      path = "M" + point.x + " " + point.y + "Q" + corner.x + " " + corner.y + " 0 0";
    }
    
    return path;
  }
  
  /**
   * Handle the user pressing the escape key during a drag
   */
  static dragEscapeHandler(e) {
    console.debug("dragEscapeHandler: " + e.which);
    if (e.which == 27 && e.data) {
      e.data.addActionDragEnd();
    }
  }
  
  /**
   * Handle the start of an action creating drag
   */
  addActionDragStart() {
    console.debug("nodeControls.addActionDragStart()");
    var self = this,
        tree = self.treeLayout,
        radius = self.getRadius(self.node);
    
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
    self.node.drag = {
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
    //console.debug("nodeControls.addActionDrag()");
    var self = this,
        d = self.node;
    
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
    console.debug("nodeControls.addActionDragEnd()");
    var self = this,
        tree = self.treeLayout,
        d = self.node;
    
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
      tree.actionHandler.addAction(d, tree.dropNodeHandler.getNode());
      
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
            delete self.node.drag;
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
  static attachPoint() {
    return $(".node-controls-back").get(0);
  }
}
