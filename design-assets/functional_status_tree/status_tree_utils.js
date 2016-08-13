/**
 * Utility functions that mostly work with coordinates
 *
 * @singleton
 */
treeUtils = {
  /**
   * Get the bounding box for a list of nodes
   * @param nodeList The nodes to gets the bounds of
   * @param margin Optionally include a margin around the bounding box
   * @returns {{minX: number, maxX: number, minY: number, maxY: number}}
   * TODO: Standardize the representation of rectangles!!
   */
  nodeListBounds: function (nodeList, margin) {
    var bounds = {
      minX: 1000000,
      maxX: -1000000,
      minY: 1000000,
      maxY: -1000000
    };

    // normalize margin to 0
    margin = margin || 0;

    // go through the nodes and get the bounds
    _.each(nodeList, function(node){
      if(node.x - node.bounds.width / 2 < bounds.minX){
        bounds.minX = node.x - node.bounds.width / 2 - margin;
      }

      if(node.x + node.bounds.width / 2 > bounds.maxX){
        bounds.maxX = node.x + node.bounds.width / 2 + margin;
      }

      if(node.y - node.bounds.height / 2 < bounds.minY){
        bounds.minY = node.y - node.bounds.height / 2 - margin;
      }

      if(node.y + node.bounds.height / 2 > bounds.maxY){
        bounds.maxY = node.y + node.bounds.height / 2 + margin;
      }
    });

    return {
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY
    };
  },

  /**
   * Set the depth of a node and recurse down the hierarchy
   * @param d
   * @param depth
   */
  setNodeDepth: function(d, depth) {
    //console.log("SetNodeDepth: ", d.title, 0);
    var children = [].concat(d.childPages, d.childViews);

    d.depth = depth;
    _.each(children, function (child) {
      treeUtils.setNodeDepth(child, depth + 1);
    });
  },

  /**
   * Calculate the maximum depth for a node which passes the given test function
   * @param nodeList The nodes to search
   * @param testFunction A test function to use (returns true/false)
   * @returns {number} The maximum depth of a node which passed the test
   */
  getMaxDepth: function(nodeList, testFunction){
    var maxDepth = 0,
        i;
    if(testFunction){
      for(i in nodeList){
        if(nodeList[i].depth > maxDepth){
          if(testFunction(nodeList[i])){
            maxDepth = nodeList[i].depth;
          }
        }
      }
    } else {
      for(i in nodeList){
        if(nodeList[i].depth > maxDepth){
          maxDepth = nodeList[i].depth;
        }
      }
    }
    return maxDepth;
  },

  /**
   * Get a list of nodes for a given depth number
   * @param nodeList The nodes to search
   * @param depth The depth to target
   * @returns {Array} The list of nodes found at that depth
   */
  getAtDepth: function (nodeList, depth) {
    var depthNodes = [];
    for(var i in nodeList){
      if(nodeList[i].depth === depth){
        depthNodes.push(nodeList[i]);
      }
    }
    return depthNodes;
  },

  /**
   * Parse a transform string for transform information
   */
  parseTranslate: function (transform) {
    if(transform && transform.match(/translate\(\s*([0-9\.]+)\s*,\s*([0-9\.]+)\s*\)/i)){
      var coords = transform.match(/translate\(\s*([0-9\.]+)\s*,\s*([0-9\.]+)\s*\)/i);

      return {
        x: parseFloat(coords[1]),
        y: parseFloat(coords[2]),
        xInt: parseInt(coords[1]),
        yInt: parseInt(coords[2])
      }
    }
  }
};

