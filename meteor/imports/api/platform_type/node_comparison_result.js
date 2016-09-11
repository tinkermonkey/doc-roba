import { NodeComparisonResultPiece } from './node_comparison_result_piece';

/**
 * Standard format for node comparison results
 */
export class NodeComparisonResult {
  /**
   * NodeComparisonResult
   * @return {NodeComparisonResult}
   */
  constructor () {
    this.match  = true;
    this.pieces = [];
    return this;
  }
  
  /**
   * Add a piece of information to the list of pieces for this comparison
   * @param index
   * @param status
   * @param search
   * @param value
   * @param score
   */
  addPiece (index, status, search, value, score) {
    this.pieces.push(new NodeComparisonResultPiece(index, status, search, value, score));
  }
  
  /**
   * Get the total score for all of the pieces
   */
  getScore () {
    return _.reduce(this.pieces, (memo, piece) => {
      return memo + piece.score
    }, 0)
  }
}