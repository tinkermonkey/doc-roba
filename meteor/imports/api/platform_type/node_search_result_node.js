/**
 * Standard format for node comparison results
 */
export class NodeSearchResultNode {
  /**
   * NodeSearchResult
   * The node being compared
   * @return {NodeSearchResult}
   */
  constructor (node) {
    this.comparisons  = {};
    this.node = node;
    this.score = 0;
    return this;
  }
  
  /**
   * Add a piece of information to the list of pieces for this comparison
   * @param key The key identifying the comparison
   * @param result NodeComparisonResult
   */
  addComparison (key, result) {
    this.score += result.getScore();
    this.comparisons[key] = result;
  }
  
  /**
   * Get the score
   * @return {*|number}
   */
  getScore(){
    return this.score;
  }
}