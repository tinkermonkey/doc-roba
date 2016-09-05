import {NodeTypes} from '../../../api/node/node_types.js';

/**
 * Handle all of the accounting for the node-link data structures
 */
export default class TreeLinkHandler {
  /**
   * TreeLinkHandler
   * @param treeLayout
   * @param config
   * @constructor
   */
  constructor(treeLayout, config) {
    var self = this;
    
    // Make sure there's a tree layout
    if (!treeLayout) {
      console.error("TreeLinkHandler constructor failed: no TreeLayout passed");
      return;
    }
    self.treeLayout = treeLayout;
    
    // Get a handle to the link layer
    self.layer = self.treeLayout.layoutRoot.select(".link-layer");
    
    // Create the link data list
    self.linkList = [];
  }
  
  /**
   * Add a link to the list of links, scan to make sure it's not a dupe
   * @param id The link id
   * @param source The source node
   * @param target The target node
   */
  addLink(id, source, target) {
    var found = false;
    var i = this.linkList.length;
    while (i > 0 && !found) {
      i--;
      var link = this.linkList[i];
      if (link.id === id && link.source === source && link.target === target) {
        link.valid = true;
        found = true;
      }
    }
    if (!found) {
      this.linkList.push({id: id, source: source, target: target, valid: true});
    }
  }
  
  /**
   * Prepare links for a validation scan
   */
  prepLinks() {
    for (var i in this.linkList) {
      this.linkList[i].valid = false;
    }
  }
  
  /**
   * Clear the link list of links no longer valid
   */
  cleanLinks() {
    var i = this.linkList.length;
    while (i > 0) {
      i--;
      if (!this.linkList[i].valid) {
        this.linkList.splice(i, 1);
      }
    }
  }
  
  /**
   * Update the links paths
   * @param duration
   */
  update(duration) {
    // Get the master link selection and update all of the links
    var self = this,
        links;
    
    // Get the existing links
    links = self.layer.selectAll(".link")
        .data(self.linkList, function (d) {
          return d.id;
        });
    
    // Update the selection
    self.createAndUpdateLinks(links, duration);
  }
  
  /**
   * Generate the path of a node link
   * @param d The source node
   * @returns {string} The SVG path for the link
   */
  generateLinkPath(d) {
    var source, target, control, path;
    if (d.source.visExpanded) {
      if (d.target.type === NodeTypes.view || d.target.type === NodeTypes.navMenu) {
        source = {
          x: d.source.x + d.source.icon.right,
          y: d.source.y
        }
        control = {
          x1: (d.source.x + d.source.icon.right + d.target.x + d.target.family.left) / 2,
          y1: d.source.y,
          x2: (d.source.x + d.source.icon.right + d.target.x + d.target.family.left) / 2,
          y2: d.target.y
        }
        target = {
          x: d.target.x + d.target.icon.left,
          y: d.target.y
        }
      } else {
        source = {
          x: d.source.x,
          y: d.source.y + (d.source.type === NodeTypes.root ? 0 : d.source.icon.bottom)
        }
        control = {
          x1: d.source.x,
          y1: (d.source.y + d.source.icon.bottom + d.target.y + d.target.family.top) / 2,
          x2: d.target.x,
          y2: (d.source.y + d.source.icon.bottom + d.target.y + d.target.family.top) / 2
        }
        target = {
          x: d.target.x,
          y: d.target.y + d.target.icon.top
        }
      }
      
      path = 'M' + source.x + ',' + source.y +
          ' C' + control.x1 + ',' + control.y1 +
          ' ' + control.x2 + ',' + control.y2 +
          ' ' + target.x + ',' + target.y; // Chrome has a bug with the verticals around the grouping
    } else {
      // stub the path with the starting position so transitions are smooth
      path = 'M' + d.source.x + ',' + d.source.y +
          ' C' + (d.source.x + 1) + ',' + (d.source.y + 1) +
          ' ' + (d.source.x + 2) + ',' + (d.source.y + 2) +
          ' ' + (d.source.x + 3) + ',' + (d.source.y + 3);
    }
    
    return path;
  }
  
  /**
   * Update the links for a selection
   */
  createAndUpdateLinks(selection, duration) {
    var self = this;
    
    // Enter any new links at the parent's previous position
    selection.enter()
        .append("path")
        .attr("class", "link")
        .attr("opacity", 0)
        .attr("d", function (d, i) {
          return self.generateLinkPath(d, i);
        });
    
    // Transition links to their new position
    selection
        .transition()
        .duration(duration)
        .attr("opacity", 1)
        .attr("d", function (d, i) {
          return self.generateLinkPath(d, i);
        });
    
    // Transition exiting nodes to the parent's new position
    selection.exit().remove();
  }
}
