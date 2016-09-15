import { NodeComparitor } from '../../../api/platform_type/node_comparitor.js';
import { NodeComparitorDatumResult } from '../../../api/platform_type/node_comparitor_datum_result';
import { NodeComparisonResult } from '../../../api/platform_type/node_comparison_result.js';

export class WebNodeComparitor extends NodeComparitor {
  constructor () {
    super();
  }
  
  
  /**
   * Compare a node to a location identifier
   * @param context
   * @param node
   */
  compareLocation (context, node) {
    
  }
  
  /**
   * Compare a title to a node page title
   * @param context
   * @param nodePageTitle
   */
  compareData (context, nodePageTitle) {
    var result      = new NodeComparisonResult(),
        title       = context.title,
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
        //console.log("compareData, piece missing: ", titlePieces[i]);
        result.match = false;
      }
      //result.score -= titlePieces.length * NodeSearch.score.title;
    }
    
    return result;
  }
}