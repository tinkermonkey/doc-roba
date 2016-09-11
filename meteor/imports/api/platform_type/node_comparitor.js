import { NodeComparitorDatumResult } from './node_comparitor_datum_result';
import { NodeComparisonResult } from './node_comparison_result.js';

/**
 * Template for a node comparitor
 */
export class NodeComparitor {
  constructor () {
    // Default scoring
    this.score = {
      url      : 5,
      param    : 5,
      title    : 5,
      pageTitle: 5
    };
    return this
  }
  
  /**
   * Search for a node by current location location identifier
   * @param locationIdentifier Url or other location identifier
   * @param projectVersionId
   */
  searchByLocation (locationIdentifier, projectVersionId) {
    
  }
  
  /**
   * Search for a node by a text term
   * @param term
   * @param projectVersionId
   */
  searchByTerm (term, projectVersionId) {
    
  }
  
  /**
   * Check to see if a node matches a locationIdentifier & title
   * @param locationIdentifier
   * @param title
   * @param node
   */
  compareNode (locationIdentifier, title, node) {
    // check the local locationIdentifier
    if (locationIdentifier && title && node) {
      let locationResult = this.compareLocation(locationIdentifier, node),
          titleResult    = this.compareTitle(title, node);
      return {
        location: locationResult,
        title   : titleResult,
        score   : locationResult.getScore() + titleResult.getScore()
      };
    } else {
      console.error("compareNode check failed:", locationIdentifier, title, node);
    }
  }
  
  /**
   * Compare a node to a location identifier
   * @param locationIdentifier
   * @param node
   */
  compareLocation (locationIdentifier, node) {
    
  }
  
  /**
   * Compare a title to a node page title
   * @param title
   * @param nodePageTitle
   */
  compareTitle (title, nodePageTitle) {
    var result      = new NodeComparisonResult(),
        titlePieces = title.split(" "),
        i;
    
    // trim extra whitespace
    _.each(titlePieces, (piece, i) => {
      titlePieces[ i ] = piece.trim();
    });
    
    // check the node title
    if (nodePageTitle) {
      // clean up the title regex
      var titleRegex      = nodePageTitle.replace(/\*/g, ".*?"),
          nodeTitlePieces = titleRegex.split(" ");
      
      // check for a full match
      if (title.match(titleRegex)) {
        // good to go
        result.addPiece(0, NodeComparitorDatumResult.match, nodePageTitle, title, nodeTitlePieces.length * this.score.title);
      } else {
        // No match, catalog the differences
        result.match = false;
        
        var pieceCount = Math.min(titlePieces.length, nodeTitlePieces.length);
        for (i = 0; i < pieceCount; i++) {
          //console.log("NodeTitlePiece: ", nodeTitlePieces[i], titlePieces[i]);
          if (titlePieces[ i ].match(nodeTitlePieces[ i ])) {
            result.addPiece(i, NodeComparitorDatumResult.match, nodeTitlePieces[ i ], titlePieces[ i ], this.score.title);
          } else {
            result.addPiece(i, NodeComparitorDatumResult.noMatch, nodeTitlePieces[ i ], titlePieces[ i ]);
          }
        }
        
        // catalog the missing pieces
        for (i = pieceCount; i < titlePieces.length; i++) {
          result.addPiece(i, NodeComparitorDatumResult.missing, nodeTitlePieces[ i ], titlePieces[ i ]);
        }
        
        // catalog the extra pieces
        for (i = pieceCount; i < nodeTitlePieces.length; i++) {
          result.addPiece(i, NodeComparitorDatumResult.extra, nodeTitlePieces[ i ], nodeTitlePieces[ i ]);
        }
        
        // subtract any difference in url length
        //result.score -= Math.abs(titlePieces.length - nodeTitlePieces.length) * NodeSearch.score.title;
      }
    } else {
      // catalog the missing params
      for (i = 0; i < titlePieces.length; i++) {
        //console.log("Missing: ", titlePieces[i]);
        result.addPiece(i, NodeComparitorDatumResult.missing, nodeTitlePieces[ i ], nodeTitlePieces[ i ]);
        //console.log("compareTitle, piece missing: ", titlePieces[i]);
        result.match = false;
      }
      //result.score -= titlePieces.length * NodeSearch.score.title;
    }
    
    return result;
  }
  
}