var debug = false;

/**
 * Standard format for node comparison results
 */
export class NodeSearchResult {
  /**
   * NodeSearch
   * The node being compared
   * @return {NodeSearch}
   */
  constructor (node) {
    this.comparisons = {};
    this.node        = node;
    this.score       = 0;
    return this;
  }
  
  /**
   * Add a piece of information to the list of pieces for this comparison
   * @param key The key identifying the comparison
   * @param result NodeComparison
   */
  addComparison (key, result) {
    debug && console.log("NodeSearchResult.addComparison:", key);
    this.score += result.getScore();
    this.comparisons[ key ] = result;
  }
  
  /**
   * Get the score
   * @return {*|number}
   */
  getScore () {
    debug && console.log("NodeSearchResult.getScore:", this.score);
    return this.score;
  }
  
  /**
   * Is this a complete match
   */
  isMatch () {
    debug && console.log("NodeSearchResult.isMatch:", _.values(this.comparisons).map(el => el.isMatch()).reduce((pre, cur) => {
      return pre && cur
    }, true));
    return _.values(this.comparisons).map(el => el.isMatch()).reduce((pre, cur) => {
      return pre && cur
    }, true)
  }
}