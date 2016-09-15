import { NodeComparisonResult } from './node_comparison_result.js';
import { NodeSearchResult } from './node_search_result.js';
import { Nodes } from '../../api/node/node.js';
import { NodeTypes } from '../../api/node/node_types.js';

/**
 * Template for a node comparitor
 */
export class NodeComparitor {
  constructor () {
    // Default scoring
    this.points = {
      locationDatumMatch   : 5,
      locationSubDatumMatch: 5,
      dataPointMatch       : 5
    };
  }
  
  /**
   * Search for a node by current location location identifier
   * @param context The current adventure state or similar context
   * @param projectVersionId
   */
  searchByContext (context, projectVersionId) {
    var self         = this,
        searchResult = new NodeSearchResult();
    
    // go through each node and score it against the current url
    Nodes.find({
      projectVersionId: projectVersionId,
      type            : {
        $in: [ NodeTypes.page, NodeTypes.view ]
      }
    }).forEach((node) => {
      searchResult.addResult(self.compareNode(context, node), node);
    });
    
    return searchResult;
  }
  
  /**
   * Search for a node by a text term
   * @param term
   * @param projectVersionId
   */
  searchByTerm (term, projectVersionId) {
    var self         = this,
        searchResult = new NodeSearchResult();
  
    // go through each node and score it against the current url
    Nodes.find({
      projectVersionId: projectVersionId,
      type            : {
        $in: [ NodeTypes.page, NodeTypes.view ]
      }
    }).forEach((node) => {
      searchResult.addResult(self.compareNode(context, node), node);
    });
  
    return searchResult;
  }
  
  /**
   * Check to see if a node matches the context
   * @param context The current adventure state or similar context
   * @param node The node to compare
   */
  compareNode (context, node) {
    // check the local locationIdentifier
    if (context && node) {
      let locationResult = this.compareLocation(context, node),
          dataResult     = this.compareData(context, node);
      return {
        location: locationResult,
        data    : dataResult,
        score   : locationResult.getScore() + dataResult.getScore()
      };
    } else {
      console.error("compareNode check failed:", context, node);
    }
  }
  
  /**
   * Compare a node to a location identifier
   * @param context
   * @param node
   */
  compareLocation (context, node) {
    return new NodeComparisonResult();
  }
  
  /**
   * Compare a title to a node page title
   * @param context
   * @param nodePageTitle
   */
  compareData (context, nodePageTitle) {
    return new NodeComparisonResult();
  }
  
}