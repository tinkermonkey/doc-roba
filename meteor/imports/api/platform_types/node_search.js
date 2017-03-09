var debug = false;

/**
 * Standard format for node search results
 */
export class NodeSearch {
  /**
   * NodeSearch
   * @return {NodeSearch}
   */
  constructor () {
    this.results  = [];
    this.maxScore = -100000;
    return this;
  }
  
  /**
   * Add a piece of information to the list of pieces for this comparison
   * @param result NodeSearchResult
   */
  addResult (result) {
    debug && console.log("NodeSearch.addComparison:", result);

    // maintain the max score
    this.maxScore = result.score > this.maxScore ? result.score : this.maxScore;
    
    this.results.push(result);
  }
  
  /**
   * Get the processed results
   */
  processedResults () {
    debug && console.log("NodeSearch.processedResults:", this.results.length);

    let self = this;
    
    // Put the Max Score for the result set on each result for quick reference
    self.results.forEach((result, i) => {
      self.results[ i ].maxScore = this.maxScore;
    });
    
    return this.results
  }
  
  /**
   * Get the total score for all of the pieces
   */
  sortedResults () {
    debug && console.log("NodeSearch.sortedResults:", this.results.length);

    let self = this;
    
    // filter out zero point scores and sort by score descending
    return _.sortBy(self.processedResults().filter((result) => {
      return result.score
    }), (result) => {
      return self.maxScore - result.score
    });
  }
  
  /**
   * Is there a clear winner?
   */
  clearWinner () {
    debug && console.log("NodeSearch.clearWinner:", this.results.length);

    let results = this.sortedResults();
    
    if(results.length == 1){
      return results[0];
    } else if(results[0].score - results[1].score > results[0].score * 0.1){
      return results[0];
    }
  }
}