import {DocTreeConfig} from '../../lib/doc_tree/doc_tree_config.js';
import {PathBuilder} from '../../lib/doc_tree/path_builder.js';

import {Actions} from '../../../api/action/action.js';

/**
 * Handle all of the accounting for the Action data structures
 */
export default class TreeActionHandler {
  /**
   * TreeActionHandler
   * @param treeLayout
   * @param config
   * @constructor
   */
  constructor(treeLayout, config) {
    var self = this;
    
    // Make sure there's a tree layout
    if (!treeLayout) {
      console.error("TreeActionHandler constructor failed: no TreeLayout passed");
      return;
    }
    self.treeLayout = treeLayout;
    
    // condense the config
    self.config = config || {};
    _.defaults(self.config, DocTreeConfig.actions);
    
    // Get a handle to the Link & Label layers
    self.linkLayer = self.treeLayout.layoutRoot.select(".action-link-layer");
    self.hoverLayerFront = self.treeLayout.layoutRoot.select(".action-hover-layer-front");
    self.hoverLayerBack = self.treeLayout.layoutRoot.select(".action-hover-layer-back");
    
    // setup a custom action label layout controller
    self.actionLabelList = [];
    
    // create a dummy label for measuring text width
    self.dummyActionLabel = self.treeLayout.layoutRoot.select("g").append("text")
        .attr("id", "dummy-action-label")
        .attr("class", "action-label-text")
        .attr("x", -10000)
        .attr("y", -10000);
    
    // create a flag to use to lock the hover state of an action
    self.locked = false;
    self.hoverActions = [];
  }
  
  /**
   * Set the master list of actions
   * @param actionList The full flat list of actions from the DB
   */
  setActions(actionList) {
    this.dbActionList = actionList;
  }
  
  /**
   * Set the list of navigation menu actions
   * @param navActions
   */
  setNavActions(navActions) {
    this.dbNavMenus = navActions;
    //console.log("navActions: ", navActions);
  }
  
  /**
   * Get the full list of actions
   * @returns [actions]
   */
  getActions() {
    return this.dbActionList;
  }
  
  /**
   * Get the full list of actions
   * @returns [navActions]
   */
  getNavActions() {
    return this.dbNavMenus;
  }
  
  /**
   * Add an action connecting two nodes
   */
  addAction(sourceNode, destinationNode) {
    console.debug("addAction: ", sourceNode, destinationNode);
    
    var actionConfig = {
      projectId: sourceNode.projectId,
      projectVersionId: sourceNode.projectVersionId,
      nodeId: sourceNode.staticId,
      routes: [{
        order: 0,
        nodeId: destinationNode.staticId
      }],
      title: 'New Action'
    };
    
    Actions.insert(actionConfig, function (error, response) {
      if (error) {
        console.error("Failed to create Action: ", error);
      } else {
        console.log("Action created: ", response);
      }
    });
  }
  
  /**
   * Add a route to an action
   */
  addRoute(action, destinationNode) {
    console.debug("addRoute: ", action, destinationNode);
    
    Actions.update({_id: action._id}, {
      $push: {
        routes: {
          order: action.routes.length,
          nodeId: destinationNode.staticId,
          routeCode: ""
        }
      }
    }, function (error, response) {
      if (error) {
        console.error("Failed to add route to Action: ", error);
      } else {
        console.log("Route added: ", response);
      }
    });
  }
  
  /**
   * Prepare the action data structures
   */
  prepActions() {
    var self = this,
        tree = self.treeLayout,
        sourceIds = [];
    
    // map all of the standard actions, keeping in mind that the DB data may be broken and point to nodes which don't exist
    self.actionRoutes = [];
    _.each(self.dbActionList, function (action, i) {
      var sourceNode = tree.nodeHandler.getByStaticId(action.nodeId);
      if (sourceNode) {
        var destinationNode,
            routes = [];
        
        // Add the source id to the tracking list if it doesn't exist
        if (sourceIds.indexOf(sourceNode.staticId) < 0) {
          sourceIds.push(sourceNode.staticId);
        }
        
        // Vet each of the route destinations
        _.each(action.routes, function (route, i) {
          destinationNode = tree.nodeHandler.getByStaticId(route.nodeId);
          if (destinationNode) {
            routes.push({
              _id: action._id,
              action: action,
              source: sourceNode,
              destination: destinationNode,
              nav: false,
              routeIndex: i,
              routeOrder: route.order
            });
          } else {
            console.error("Broken route: ", route, action);
          }
        });
        
        // sort the routes by destination location
        routes = _.sortBy(routes, function (r) {
          return r.destination.x
        });
        
        // store the sort index for fast access
        _.each(routes, function (r, i) {
          r.routeSortIndex = i
        });
        
        // merge these into the master list
        self.actionRoutes = self.actionRoutes.concat(routes);
      } else {
        console.error("Orphaned action: ", action);
      }
    });
    
    // map all of the navMenu actions
    _.each(self.dbNavMenus, function (navMenu, i) {
      _.each(navMenu.actions, function (navAction) {
        _.each(navMenu.nodes, function (sourceNodeId) {
          var sourceNode = tree.nodeHandler.getByStaticId(sourceNodeId);
          if (sourceNode) {
            var destinationNode,
                routes = [];
            
            // Add the source id to the tracking list if it doesn't exist
            if (sourceIds.indexOf(sourceNode.staticId) < 0) {
              sourceIds.push(sourceNode.staticId);
            }
            
            // Vet each of the route destinations
            _.each(navAction.routes, function (route, i) {
              destinationNode = tree.nodeHandler.getByStaticId(route.nodeId);
              if (destinationNode) {
                routes.push({
                  _id: navAction._id,
                  action: navAction,
                  source: sourceNode,
                  destination: destinationNode,
                  nav: true,
                  routeIndex: i,
                  routeOrder: route.order
                });
                //console.log("Nav Route added: ", routes[routes.length - 1]);
              } else {
                console.error("Broken route: ", route, navAction);
              }
            });
            
            // sort the routes by destination location
            routes = _.sortBy(routes, function (r) {
              return r.destination.x
            });
            
            // store the sort index for fast access
            _.each(routes, function (r, i) {
              r.routeSortIndex = i
            });
            
            // merge these into the master list
            self.actionRoutes = self.actionRoutes.concat(routes);
          } else {
            console.error("Orphaned action: ", navAction);
          }
        });
      });
    });
    
    // Group the routes by source node and order them by destination location
    var baseRoutes = [],
        nodeRoutes = [],
        baseRouteLookup, rightRoutes, leftRoutes;
    
    _.each(sourceIds, function (id) {
      rightRoutes = [];
      leftRoutes = [];
      baseRouteLookup = {};
      
      // Get all of the routes for this node
      nodeRoutes = _.filter(self.actionRoutes, function (r) {
        return r.source.staticId == id
      });
      
      // get the left-most routes for each action for this node
      baseRoutes = _.filter(nodeRoutes, function (r) {
        return r.routeSortIndex == 0
      });
      
      // Go through each of the actions, using route 0 as a starting point
      _.each(_.sortBy(baseRoutes, function (r) {
        return r.destination.x
      }), function (r, i) {
        baseRouteLookup[r._id] = r;
        self.setRouteDirection(r);
        
        // keep track of which x direction the destination is
        if (r.dir > 0) {
          rightRoutes.push(r._id);
          r.index = rightRoutes.length - 1;
        } else {
          leftRoutes.push(r._id);
          r.index = leftRoutes.length - 1;
        }
      });
      
      // We have to sort left to right
      _.each(_.sortBy(leftRoutes, function (id) {
        return baseRouteLookup[id].destination.x
      }), function (id, i) {
        baseRouteLookup[id].actionSortIndex = i;
      });
      _.each(_.sortBy(rightRoutes, function (id) {
        return baseRouteLookup[id].destination.x
      }), function (id, i) {
        baseRouteLookup[id].actionSortIndex = leftRoutes.length + i;
      });
      
      // Now go through all routes, and set the parameters
      _.each(nodeRoutes, function (r) {
        if (r.routeIndex > 0 && baseRouteLookup[r._id]) {
          r.actionSortIndex = baseRouteLookup[r._id].actionSortIndex;
          self.setRouteDirection(r);
          
          // If the lesser route direction is different from the base route direction
          if (r.dir !== baseRouteLookup[r._id].dir) {
            if (r.dir > 0) {
              if (!_.contains(rightRoutes, r._id)) {
                rightRoutes.push(r._id);
                r.index = rightRoutes.length - 1;
              } else {
                r.index = rightRoutes.indexOf(r._id);
              }
            } else {
              if (!_.contains(leftRoutes, r._id)) {
                leftRoutes.push(r._id);
                r.index = leftRoutes.length - 1;
              } else {
                r.index = leftRoutes.indexOf(r._id);
              }
            }
          } else {
            r.index = baseRouteLookup[r._id].index;
          }
        } else if (!baseRouteLookup[r._id]) {
          console.error("Base Route Lookup failed: ", r);
        }
      });
      
      // Make a final pass to store the count info
      _.each(nodeRoutes, function (r) {
        r.baseRoute = baseRouteLookup[r._id];
        r.actionCount = baseRoutes.length;
        r.count = r.dir > 0 ? rightRoutes.length : leftRoutes.length;
      });
      
    });
  }
  
  /**
   * Calculate the direction that a route will take (left or right)
   * @param r
   */
  static setRouteDirection(r) {
    // direction can get complicated
    if (r.destination.y >= r.source.y) {
      r.dir = r.destination.x > r.source.x ? 1 : -1;
    } else {
      r.dir = r.destination.x >= (r.source.x + r.source.bounds.width / 2 + r.destination.bounds.width / 2) ? 1 : -1;
    }
  }
  
  static getRouteIdentifier(d) {
    return d._id + "_" + d.source._id + "_" + d.routeIndex;
  }
  
  /**
   * Clear the list of visible actions
   */
  clearVisibleActions() {
    console.log("clearVisibleActions");
    var self = this;
    
    self.visibleActionList = [];
    self.hoverActions = [];
    self.updateActionDisplay();
  }
  
  /**
   * Update the display of all of the actions currently visible
   * @param duration
   */
  update(duration) {
    //console.log("TreeActionHandler.update");
    var self = this,
        actions;
    
    // gather the existing action links and set the data
    actions = self.linkLayer.selectAll(".action-group")
        .data(self.actionRoutes, function (d) {
          return self.getRouteIdentifier(d)
        });
    
    // Update the action links
    self.createAndUpdateLinks(actions, duration);
    
    // Update the action labels
    self.updateActionDisplay();
    
    // Update the hover actions
    if (self.hoverActions.length) {
      var hoverActionRoutes = _.filter(self.actionRoutes, function (d) {
        return _.contains(self.hoverActions, self.getRouteIdentifier(d))
      });
      if (hoverActionRoutes.length && self.treeLayout.actionControls) {
        self.treeLayout.actionControls.action = hoverActionRoutes[0];
        //hoverActionRoutes[0].x = self.treeLayout.actionControls.action.x = self.hoverRoute.x;
        //hoverActionRoutes[0].y = self.treeLayout.actionControls.action.y = self.hoverRoute.y;
        self.treeLayout.actionControls.action.x = hoverActionRoutes[0].x;
        self.treeLayout.actionControls.action.y = hoverActionRoutes[0].y;
        self.treeLayout.actionControls.update(0);
        self.updateHover(hoverActionRoutes[0]);
      }
    }
  }
  
  /**
   * Show the correct set of actions
   */
  updateActionDisplay() {
    var self = this,
        tree = self.treeLayout,
        startPoint;
    
    // clear out what is displayed
    self.linkLayer.selectAll('.action-vis').classed("action-vis", false);
    
    // clear the select state if there is nothing to display
    self.linkLayer.selectAll(".action-link-select").classed('action-link-select', false);
    
    // show all of the actions requested
    _.each(self.visibleActionList, function (d) {
      self.linkLayer.selectAll('.action-' + d).classed("action-vis", true);
    });
    
    // compile the list of actions by filtering for visibility
    self.actionLabelList = _.filter(tree.layoutRoot.selectAll(".action-vis").data(), function (d) {
      return d.source.parent.visExpanded;
    });
    
    // go through each action and calculate where the foci should be
    _.each(self.actionLabelList, function (d) {
      // set a default title
      d.action.title = d.action.title || "untitled";
      
      // measure the title width of the label
      self.dummyActionLabel.text(d.action.title);
      d.labelWidth = self.dummyActionLabel.node().getBBox().width;
      d.labelHeight = self.dummyActionLabel.node().getBBox().height;
      
      var node = tree.layoutRoot.select(".action-" + d._id + ".action-" + d.source._id).select(".action").node();
      if (node) {
        startPoint = node.getPointAtLength(0);
        
        d.x = startPoint.x;
        d.y = startPoint.y + (d.labelHeight / 2) + self.config.textYMargin;
      }
    });
  }
  
  /**
   * Create and update the links representing actions
   * @param selection
   * @param duration
   */
  createAndUpdateLinks(selection, duration) {
    var self = this,
        tree = self.treeLayout;
    
    // Enter any new links at the parent's previous position
    var actionGroupEnter = selection.enter()
        .append("g")
        .attr("class", function (d) {
          return "action-group action-" + d.source._id + " action-" + d._id;
        })
        .on("click", tree.actionClickHandler.bind(tree))
        .on("mouseenter", tree.actionMouseEnterHandler.bind(tree))
        .on("mouseleave", tree.actionMouseLeaveHandler.bind(tree));
    
    actionGroupEnter.append("path")
        .attr("class", "action-hover-back")
        .attr("d", function (d, i) {
          return self.generateActionPath(d);
        });
    
    actionGroupEnter.append("path")
        .attr("class", "action")
        .classed("action-blunt", function (d) {
          return !d.destination.parent.visExpanded
        })
        .classed("action-nav", function (d) {
          return d.nav
        })
        .attr("d", function (d, i) {
          return self.generateActionPath(d);
        });
    
    // Transition links to their new position
    selection.select(".action")
        .classed("action-blunt", function (d) {
          return !d.destination.parent.visExpanded
        })
        .transition()
        .duration(duration)
        .attr("d", function (d, i) {
          return self.generateActionPath(d);
        });
    
    selection.select(".action-hover-back")
        .classed("action-blunt", function (d) {
          return !d.destination.parent.visExpanded
        })
        .transition()
        .duration(duration)
        .attr("d", function (d, i) {
          return self.generateActionPath(d);
        });
    
    // Transition exiting nodes to the parent's new position
    selection.exit()
        .transition()
        .duration(duration)
        .remove();
  }
  
  /**
   * Create or update the action labels
   * @param selection
   */
  createAndUpdateLabels(selection) {
    var self = this,
        tree = self.treeLayout,
        labelGroup;
    
    // create new labels
    labelGroup = selection.enter().append("g")
        .attr("class", function (d) {
          return "action-label action-label-" + d._id;
        })
        .on("click", tree.actionClickHandler.bind(tree))
        .on("mouseenter", tree.actionMouseEnterHandler.bind(tree))
        .on("mouseleave", tree.actionMouseLeaveHandler.bind(tree));
    
    labelGroup.append("rect")
        .attr("class", "action-label-back")
        .attr("rx", self.config.cornerRadius)
        .attr("ry", self.config.cornerRadius);
    
    labelGroup.append("text")
        .attr("class", "action-label-text no-select-complete");
    
    // update existing labels
    selection
        .attr("transform", function (d) {
          return "translate(" + (d.x) + "," + (d.y) + ")"
        });
    selection.select(".action-label-back")
        .attr("x", function (d) {
          return d.labelWidth / -2 - self.config.textXMargin / 2
        })
        .attr("y", function (d) {
          return d.labelHeight / -2 - self.config.textYMargin / 2
        })
        .attr("width", function (d) {
          return d.labelWidth + self.config.textXMargin
        })
        .attr("height", function (d) {
          return d.labelHeight + self.config.textYMargin
        });
    selection.select(".action-label-text")
        .text(function (d) {
          return d.action.title
        })
        .attr("x", 0)
        .attr("y", function (d) {
          return d.labelHeight / 2 - 2
        });
    
    // remove non-existing labels
    selection.exit().remove();
  }
  
  /**
   * Generate the path of a node action
   * @param r The node
   * @returns {string} The SVG path for the action
   */
  generateActionPath(r) {
    //console.log("GenerateActionPath: ", r);
    var self = this,
        config = self.treeLayout.nodeHandler.config,
        arrowTipComp = -3,
        source, destination, path;
    
    if (r.source.parent.visExpanded) {
      //if(r.source.parent.visExpanded && r.destination.parent.visExpanded){
      // provide centering based on the number of siblings
      source = {
        //x: r.source.x + -1 * ((r.actionCount -1) * 10 / 2) + r.actionSortIndex * 10,
        x: r.source.x,
        y: r.source.y + r.source.icon.bottom
      };
      
      destination = {
        x: r.destination.x,
        y: r.destination.y + r.destination.icon.top
      };
      
      /*
       Points are laid out from source to destination
       Two configurations, one with a middle vertical segment
       
       D----C                           [source]       [source]
       |    |                              |              |
       [Dest]  |   [source]          B--------A              A---B
       |      |              |                           |
       B------A              |                       D---C
       [Dest]                     |
       [Dest]
       
       */
      
      // go through
      //var delta = r.dir > 0 ? -1 * ((r.count - 1) * 6 / 2) + r.index * 6 : -1 * ((r.count - 1) * 6 / 2) + (r.count - r.index -1) * 6,
      var delta = 0,
          pointA = {
            x: source.x,
            y: source.y + config.yMargin / 2 - delta,
            radius: (config.yMargin / 2 - delta) / 2
          },
          pointB = {
            x: r.source.x + (r.dir > 0 ? r.source.icon.right : r.source.icon.left) + (r.dir * config.xMargin / 2) - r.dir * delta,
            y: pointA.y,
            radius: pointA.radius
          },
          pointC = {
            x: pointB.x,
            //y: destination.y - config.yMargin / 2,
            y: destination.y - config.yMargin / 2 - delta,
            radius: (config.yMargin / 2 + delta) / 2
          },
          pointD = {
            x: destination.x,
            y: pointC.y,
            radius: (destination.y - pointC.y) / 2
          },
          dirAB = r.dir,
          dirCD = pointD.x < pointC.x ? -1 : 1;
      
      // Path that routes "up"
      if (pointD.y < pointA.y) {
        path = PathBuilder.start()
            .M(source.x, source.y);
        
        path.L(pointA.x, pointA.y - pointA.radius)
            .q(0, pointA.radius, dirAB * pointA.radius, pointA.radius);
        
        path = path.L(pointB.x - dirAB * pointB.radius, pointB.y)
            .q(dirAB * pointB.radius, 0, dirAB * pointB.radius, -1 * pointB.radius)
            .L(pointC.x, pointC.y + pointC.radius)
            .q(0, -1 * pointC.radius, dirCD * pointC.radius, -1 * pointC.radius)
            .L(pointD.x - dirCD * pointD.radius, pointD.y)
            .q(dirCD * pointD.radius, 0, dirCD * pointD.radius, pointD.radius)
            .L(destination.x, destination.y + arrowTipComp)
            .compile();
      } else {
        var dirAD = pointD.x < pointA.x ? -1 : 1;
        
        // path that routes "down"
        pointA.radius = Math.min(pointA.radius, Math.abs(pointD.x - pointA.x) / 2);
        pointD.radius = Math.min(pointD.radius, Math.abs(pointD.x - pointA.x) / 2);
        path = PathBuilder.start()
            .M(source.x, source.y);
        
        path.L(pointA.x, (Math.max(pointA.y, pointD.y)) - pointA.radius)
            .q(0, pointA.radius, dirAD * pointA.radius, pointA.radius);
        
        path = path.L(pointD.x - dirAD * pointD.radius, pointD.y)
            .q(dirAD * pointD.radius, 0, dirAD * pointD.radius, pointD.radius)
            .L(destination.x, destination.y + arrowTipComp)
            .compile();
      }
    } else {
      // stub the path with the starting position so transitions are smooth
      path = 'M' + r.source.x + ',' + r.source.y;
    }
    
    return path;
  }
  
  /**
   * Show the hover state for an action
   * @param d
   * @param event
   */
  hover(d, event) {
    //console.log("hover: ", d);
    var self = this,
        tree = self.treeLayout;
    
    // make sure it's not locked
    if (self.locked) {
      return;
    }
    
    // get all of the routes for this action
    var routes = self.linkLayer.selectAll(".action-" + d._id + ".action-" + d.source._id).data();
    
    // Store the id for updates
    if (d.action && d.action.staticId) {
      self.hoverActions = [self.getRouteIdentifier(d)];
    } else {
      console.error("Action Hover Failed: invalid data point passed");
      return;
    }
    
    // set the label coordinates if there is an event to pull location from
    //var coords = tree.screenToLocalCoordinates({x: event.clientX, y: event.clientY});
    //d.x = d.x - (d.labelWidth / 2) - self.config.textXMargin;
    //d.y = coords.y - d.labelHeight - self.config.textYMargin;
    /*
     self.hoverRoute = {
     x: d.x - (d.labelWidth / 2) - self.config.textXMargin,
     y: d.y + (d.labelHeight / 2)
     }
     */
    
    var actions = self.hoverLayerBack.selectAll(".action")
        .data(routes, function (d) {
          return self.getRouteIdentifier(d)
        });
    
    var labels = self.hoverLayerFront.selectAll(".action-label")
        .data([d], function (d) {
          return self.getRouteIdentifier(d)
        });
    
    // Update the action links
    self.createAndUpdateLinks(actions);
    self.createAndUpdateLabels(labels);
    
    // highlight the action
    self.hoverLayerBack.selectAll(".action")
        .classed("action-vis", true)
        .classed("action-link-hover", true);
    self.hoverLayerBack.selectAll(".action-blunt")
        .classed("action-link-blunt-hover", true);
    self.hoverLayerFront.selectAll(".action-label")
        .classed("action-label-hover", true);
    
    // Add some event listeners
    tree.layoutRoot.selectAll(".action-link-hover, .action-label-hover")
        .on('mouseenter', function () {
          self.cancelHiding();
          if (self.treeLayout.actionControls) {
            self.treeLayout.actionControls.cancelHiding();
          }
        })
        .on('mouseleave', function () {
          self.considerHiding();
          if (self.treeLayout.actionControls) {
            self.treeLayout.actionControls.considerHiding();
          }
        });
  }
  
  /**
   * Update the hover state for an action
   * @param route
   */
  updateHover(route) {
    //console.log("updateHover: ", action);
    var self = this,
        tree = self.treeLayout;
    
    // get all of the routes for this action
    var routes = self.linkLayer.selectAll(".action-" + route._id + ".action-" + route.source._id).data();
    
    var actions = self.hoverLayerBack.selectAll(".action")
        .data(routes, function (d) {
          return self.getRouteIdentifier(d)
        });
    
    var labels = self.hoverLayerFront.selectAll(".action-label")
        .data([route], function (d) {
          return self.getRouteIdentifier(d)
        });
    
    // Update the action links
    self.createAndUpdateLinks(actions);
    self.createAndUpdateLabels(labels);
    
    // highlight the action
    self.hoverLayerBack.selectAll(".action")
        .classed("action-vis", true)
        .classed("action-link-hover", true);
    self.hoverLayerFront.selectAll(".action-label")
        .classed("action-label-hover", true);
    
    // Add event listeners for any new routes
    /*
     actions.enter()
     .on('mouseenter', function () {
     self.cancelHiding();
     self.treeLayout.actionControls.cancelHiding();
     })
     .on('mouseleave', function () {
     self.considerHiding();
     self.treeLayout.actionControls.considerHiding();
     });
     */
  }
  
  /**
   * Consider hiding the hovered action
   */
  considerHiding() {
    //console.debug("TreeActionHandler.considerHiding()");
    var self = this;
    
    // make sure it's not locked
    if (self.locked) {
      console.log("considerHiding: locked");
      return;
    }
    
    if (self.hideTimeout) {
      clearTimeout(self.hideTimeout);
    }
    
    self.hideTimeout = setTimeout(function () {
      self.hideHover();
    }, self.config.hideTimer);
  }
  
  /**
   * Cancel hiding the hovered node
   */
  cancelHiding() {
    //console.debug("TreeActionHandler.cancelHiding()");
    var self = this;
    
    if (self.hideTimeout) {
      clearTimeout(self.hideTimeout);
    }
  }
  
  /**
   * Hide the hovered node
   */
  hideHover() {
    var self = this;
    
    // make sure it's not locked
    if (self.locked) {
      return;
    }
    
    self.hoverActions = [];
    self.hoverLayerBack.selectAll(".action").remove();
    self.hoverLayerFront.selectAll(".action-label").remove();
  }
  
  
  /**
   * Lock the current hover state
   */
  lock() {
    //console.debug("ActionHandler: lock");
    this.locked = true;
  }
  
  /**
   * Unlock the hover state
   */
  unlock() {
    //console.debug("ActionHandler: unlock");
    this.locked = false;
  }
  
  /**
   * Edit an action
   * @param d The action data node to edit
   */
  editAction(d) {
    var self = this,
        tree = self.treeLayout,
        action = Actions.findOne(d._id),
        nodeList;
    
    // Clear the selected nodes
    tree.layoutRoot.selectAll('.node-selected').classed("node-selected", false);
    
    // select the source and destination nodes
    tree.layoutRoot.select("#node_" + d.source._id + " .node").classed("node-selected", true);
    tree.layoutRoot.select("#node_" + d.destination._id + " .node").classed("node-selected", true);
    
    // lock the action hover state and the node controls
    self.hoverLayerFront.select(".action-label-" + d._id).classed("action-label-edit", true);
    self.lock();
    if (tree.actionControls) {
      tree.actionControls.show(d);
    }
    
    // get the list of nodes for all routes
    nodeList = _.map(action.routes, function (route) {
      return tree.nodeHandler.getByStaticId(route.nodeId);
    });
    nodeList.push(tree.nodeHandler.getNode(d.source._id));
    
    // Show the drawer with the edit action template
    tree.popover(nodeList, {
      contentTemplate: 'edit_action',
      contentData: {_id: d._id}
    }, tree.actionControls, function () {
      self.unlock();
      tree.actionControls.unlock();
      self.hoverLayerFront.select(".action-label-edit").classed("action-label-edit", false);
      
      self.clearVisibleActions();
      self.hideHover();
      tree.actionControls.hide();
    });
  }
}
