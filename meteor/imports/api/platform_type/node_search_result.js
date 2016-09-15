/**
 * Standard format for node comparison results
 */
export class NodeSearchResult {
  /**
   * NodeSearchResult
   * @return {NodeSearchResult}
   */
  constructor () {
    this.results  = [];
    this.maxScore = -100000;
    return this;
  }
  
  /**
   * Add a piece of information to the list of pieces for this comparison
   * @param result NodeComparisonResult
   * @param node The node that was being compared to
   */
  addResult (result, node) {
    result.node = node;
    
    // maintain the max score
    maxScore = result.score > maxScore ? result.score : maxScore;
    
    this.results.push(result);
  }
  
  /**
   * Get the processed results
   */
  processedResults () {
    let self = this;
    
    //
    self.results.forEach((result, i) => {
      self.results[ i ].maxScore = this.maxScore;
    });
    
    return this.results
  }
  
  /**
   * Get the total score for all of the pieces
   */
  sortedResults () {
    let self = this;
    
    // filter out zero point scores and sort by score descending
    return _.sortBy(self.processedResults().filter((result) => {
      return result.score
    }), (result) => {
      return self.maxScore - result.score
    });
  }
}