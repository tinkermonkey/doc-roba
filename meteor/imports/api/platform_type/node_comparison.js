import { NodeComparisonDatum } from './node_comparison_datum.js';
import { NodeComparisonDatumResult, NodeComparisonDatumResultLookup } from './node_comparison_datum_result.js';

var pointValues = {
      match  : 10,
      noMatch: 0,
      missing: -1,
      extra  : -1,
    },
    debug        = false;

/**
 * Standard format for node comparison results
 */
export class NodeComparison {
  /**
   * NodeComparison
   * @return {NodeComparison}
   */
  constructor (search, comparison) {
    this.pieces     = [];
    this.search     = search;
    this.comparison = comparison;
    return this;
  }
  
  /**
   * Add a piece of information to the list of pieces for this comparison
   * @param index The index of this piece in the set
   * @param status NodeComparisonDatumResult value
   * @param search
   * @param value
   */
  addPiece (index, status, search, value) {
    //debug && console.log("NodeComparison.addPiece:", index, status, search, value, score);
    // determine the points
    let points = pointValues[NodeComparisonDatumResultLookup[status]];
    this.pieces.push(new NodeComparisonDatum(index, status, search, value, points));
  }
  
  /**
   * Get the total score for all of the pieces
   */
  getScore () {
    debug && console.log("NodeComparison.getScore:", _.reduce(this.pieces, (memo, piece) => {
      return memo + piece.score
    }, 0));
    return _.reduce(this.pieces, (memo, piece) => {
      return memo + piece.score
    }, 0)
  }
  
  /**
   * Is this comparison a complete match?
   */
  isMatch () {
    if(this.pieces.length){
      debug && console.log("NodeComparison.isMatch:", this.search, this.comparison, this.pieces.map(el => el.status).reduce((pre, cur) => {
        return pre && cur == NodeComparisonDatumResult.match
      }, true));
      return this.pieces.map(el => el.status).reduce((pre, cur) => {
        return pre && cur == NodeComparisonDatumResult.match
      }, true)
    } else {
      debug && console.log("NodeComparison.isMatch has no pieces:", this.search, this.comparison);
      return true;
    }
  }
  
  /**
   * Compare two pieces of text for similarity
   * @param search
   * @param comparison
   */
  textComparison (search, comparison) {
    //debug && console.log("NodeComparison.textComparison:", search, comparison);
    let self             = this,
        searchPieces     = (self.search || '').toLowerCase().split(" ").filter((piece) => {
          return piece.length > 0
        }),
        comparisonPieces = (self.comparison || '').toLowerCase().split(" ").filter((piece) => {
          return piece.length > 0
        });
    return self.unOrderedComparison(searchPieces, comparisonPieces);
  }
  
  /**
   * Perform an ordered comparison of two arrays
   * @param searchPieces
   * @param comparisonPieces
   * @param compareFn (optional) Function to perform the comparison
   * @return {NodeComparison}
   */
  orderedComparison (searchPieces, comparisonPieces, compareFn) {
    debug && console.log("NodeComparison.orderedComparison:", searchPieces, comparisonPieces, compareFn);
    let self           = this,
        indicesChecked = [];
    
    // Do the search pieces occur in the comparison pieces in order
    searchPieces.forEach((piece, i) => {
      debug && console.log("NodeComparison.orderedComparison searching for piece [", piece, "]");
      let isMatch = false,
          status, comparisonPiece;
      
      if (i < comparisonPieces.length) {
        comparisonPiece = comparisonPieces[ i ];
        indicesChecked.push(i);
        
        if (compareFn) {
          isMatch = compareFn(piece, comparisonPiece);
        } else if (comparisonPiece) {
          let test = new RegExp(piece);
          isMatch  = comparisonPiece.match(test) != null;
          debug && console.log("NodeComparison.orderedComparison result:", test, isMatch);
        }
        
        if (comparisonPiece && isMatch) {
          debug && console.log("NodeComparison.orderedComparison match");
          status = NodeComparisonDatumResult.match;
        } else {
          debug && console.log("NodeComparison.orderedComparison noMatch");
          status = NodeComparisonDatumResult.noMatch;
        }
      } else {
        debug && console.log("NodeComparison.orderedComparison missing");
        status = NodeComparisonDatumResult.missing;
      }
      
      self.addPiece(i, status, piece, comparisonPiece);
    });
    
    // Catalogue the extra pieces
    comparisonPieces.forEach((piece, i) => {
      if (!_.contains(indicesChecked, i)) {
        self.addPiece(i, NodeComparisonDatumResult.extra, null, piece);
      }
    });
    
    return self;
  }
  
  /**
   * Perform an un-ordered comparison of two arrays
   * @param searchPieces
   * @param comparisonPieces
   * @param containsFn (optional) An optional function to perform the array.contains check
   * @return {NodeComparison}
   */
  unOrderedComparison (searchPieces, comparisonPieces, containsFn, uniqFn) {
    //debug && console.log("NodeComparison.unOrderedComparison:", searchPieces, comparisonPieces, containsFn);
    let self   = this,
        pieces = _.uniq(searchPieces.concat(comparisonPieces), false, uniqFn);
    
    // do the search pieces occur in the comparison pieces in order
    pieces.forEach((piece, i) => {
      //debug && console.log("NodeComparison.unOrderedComparison searching for piece [", piece, "]");
      let inSearch     = containsFn ? containsFn(searchPieces, piece) : _.contains(searchPieces, piece),
          inComparison = containsFn ? containsFn(comparisonPieces, piece) : _.contains(comparisonPieces, piece),
          status, searchPiece, comparisonPiece;
      
      if (inSearch && inComparison) {
        status          = NodeComparisonDatumResult.match;
        comparisonPiece = searchPiece = piece;
      } else if (inSearch) {
        status      = NodeComparisonDatumResult.missing;
        searchPiece = piece;
      } else if (inComparison) {
        status          = NodeComparisonDatumResult.extra;
        comparisonPiece = piece;
      }
      
      self.addPiece(i, status, searchPiece, comparisonPiece);
    });
    
    return self;
  }
}