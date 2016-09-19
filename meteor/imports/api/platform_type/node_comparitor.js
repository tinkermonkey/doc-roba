import { NodeComparisonDatumResult } from './node_comparison_datum_result.js';
import { NodeSearchResult } from './node_search_result.js';
import { NodeComparison } from './node_comparison.js';
import { NodeSearch } from './node_search.js';
import { Nodes } from '../../api/node/node.js';
import { NodeTypes } from '../../api/node/node_types.js';

var debug = false;

/**
 * Template for a node comparitor
 *
 * Results class hierarchy:
 *
 * NodeSearch               - Result of searching a set of nodes for a match
 * - NodeSearchResult         - Result of comparing a single node to a context
 * -- NodeComparison        - Result of comparing a dimension of a node to a dimension of a context
 * --- NodeComparisonDatum  - Details of comparing a dimension of a node to a dimension of a context
 */
export class NodeComparitor {
  constructor () {
  }
  
  /**
   * Search for a node by current location location identifier
   * @param context The current adventure state or similar context
   * @param projectVersionId
   */
  searchByContext (context, projectVersionId) {
    debug && console.log("NodeComparitor.searchByContext:", context, projectVersionId);
    var self         = this,
        searchResult = new NodeSearch();
    
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
   * @param searchTerm
   * @param projectVersionId
   */
  searchByTerm (searchTerm, projectVersionId) {
    debug && console.log("NodeComparitor.searchByTerm:", searchTerm, projectVersionId);
    var self         = this,
        searchResult = new NodeSearch();
    
    // go through each node and score it against the current url
    Nodes.find({
      projectVersionId: projectVersionId,
      type            : { $in: [ NodeTypes.page, NodeTypes.view ] },
      title           : { $regex: searchTerm, $options: "i" },
    }).forEach(function (node) {
      let nodeResult = new NodeSearchResult(node);
      nodeResult.addComparison('title', new NodeComparison(searchTerm, node.title).textComparison());
      searchResult.push(nodeResult);
    });
    
    return searchResult;
  }
  
  /**
   * Check to see if a node matches the context
   * @param context The current adventure state or similar context
   * @param node The node to compare
   */
  compareNode (context, node) {
    debug && console.log("NodeComparitor.compareNode:", context, node);
    // check the local locationIdentifier
    if (context && node) {
      let self   = this,
          result = new NodeSearchResult(node);
      
      // This needs to be overridden to be useful
      result.addComparison('title', new NodeComparison(context.title, node.title).textComparison());
      return result;
    } else {
      console.error("compareNode check failed due to missing data:", context, node);
    }
  }
}