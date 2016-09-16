import { NodeComparitorDatumResult } from './node_comparitor_datum_result.js';
import { NodeSearchResultNode } from './node_search_result_node.js';
import { NodeComparisonResult } from './node_comparison_result.js';
import { NodeSearchResult } from './node_search_result.js';
import { Nodes } from '../../api/node/node.js';
import { NodeTypes } from '../../api/node/node_types.js';

/**
 * Template for a node comparitor
 *
 * Results class hierarchy:
 *
 * NodeSearchResult                - Result of searching a set of nodes for a match
 * - NodeSearchResultNode          - Result of comparing a single node to a context
 * -- NodeSearchResultComparison   - Result of comparing a dimension of a node to a dimension of a context
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
   * @param searchTerm
   * @param projectVersionId
   */
  searchByTerm (searchTerm, projectVersionId) {
    var self         = this,
        searchResult = new NodeSearchResult();
    
    // go through each node and score it against the current url
    Nodes.find({
      projectVersionId: projectVersionId,
      type            : { $in: [ NodeTypes.page, NodeTypes.view ] },
      title           : { $regex: searchTerm, $options: "i" },
    }).forEach(function (node) {
      let nodeResult = new NodeSearchResultNode(node);
      nodeResult.addComparison('title', self.compareText(searchTerm, node.title));
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
    // check the local locationIdentifier
    if (context && node) {
      let self   = this,
          result = new NodeSearchResultNode(node);
      
      // This needs to be overridden to be useful
      result.addComparison('title', self.compareText(context.title, node.title));
      return result;
    } else {
      console.error("compareNode check failed due to missing data:", context, node);
    }
  }
  
  /**
   * Compare two pieces of text for similarity
   * @param search
   * @param comparison
   */
  compareText (search, comparison) {
    let self             = this,
        searchPieces     = search.toLowerCase().split(" "),
        comparisonPieces = comparison.toLowerCase().split(" ");
    
    return self.unOrderedComparison(searchPieces, comparisonPieces);
  }
  
  /**
   * Perform an un-ordered comparison of two arrays
   * @param searchPieces
   * @param comparisonPieces
   * @param containsFn (optional) An optional function to perform the array.contains check
   * @return {NodeComparisonResult}
   */
  unOrderedComparison (searchPieces, comparisonPieces, containsFn) {
    let self   = this,
        result = new NodeComparisonResult(),
        pieces = _.uniq(_.concat(searchPieces, comparisonPieces));
    
    // do the search pieces occur in the comparison pieces in order
    pieces.forEach((piece, i) => {
      console.log("unOrderedComparison searching for piece [", piece, "]");
      let inSearch     = containsFn ? containsFn(searchPieces, piece) : _.contains(searchPieces, piece),
          inComparison = containsFn ? containsFn(comparisonPieces, piece) : _.contains(comparisonPieces, piece),
          points       = 0,
          status, searchPiece, comparisonPiece;
      
      if (inSearch && inComparison) {
        status          = NodeComparitorDatumResult.match;
        points          = self.points.dataPointMatch;
        comparisonPiece = searchPiece = piece;
      } else if (inSearch) {
        status      = NodeComparitorDatumResult.missing;
        searchPiece = piece;
      } else if (inComparison) {
        status          = NodeComparitorDatumResult.extra;
        comparisonPiece = piece;
      }
      
      result.addPiece(i, status, searchPiece, comparisonPiece, points);
    });
    
    return result;
  }
  
  /**
   * Perform an ordered comparison of two arrays
   * @param searchPieces
   * @param comparisonPieces
   * @param compareFn (optional) Function to perform the comparison
   * @return {NodeComparisonResult}
   */
  orderedComparison (searchPieces, comparisonPieces, compareFn) {
    let self           = this,
        result         = new NodeComparisonResult(),
        indicesChecked = [];
    
    // Do the search pieces occur in the comparison pieces in order
    searchPieces.forEach((piece, i) => {
      console.log("orderedComparison searching for piece [", piece, "]");
      let points = 0,
          status, comparisonPiece, isMatch;
      
      if (i < comparisonPieces.length - 1) {
        comparisonPiece = comparisonPieces[ i ];
        indicesChecked.push(i);
        
        if (compareFn) {
          isMatch = compareFn(piece, comparisonPiece);
        } else {
          isMatch = new RegExp(piece).match(comparisonPiece);
        }
        
        if (comparisonPiece && isMatch) {
          status = NodeComparitorDatumResult.match;
          points = self.points.dataPointMatch;
        } else {
          status = NodeComparitorDatumResult.noMatch;
        }
      } else {
        status = NodeComparitorDatumResult.missing;
      }
      
      result.addPiece(i, status, piece, comparisonPiece, points);
    });
    
    // Catalogue the extra pieces
    comparisonPieces.forEach((piece, i) => {
      if (!_.contains(indicesChecked, i)) {
        result.addPiece(i, NodeComparitorDatumResult.extra, null, piece, 0);
      }
    });
    
    return result;
  }
}