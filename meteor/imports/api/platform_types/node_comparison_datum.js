import { NodeComparisonDatumResult } from './node_comparison_datum_result.js';

var debug = false;

/**
 * Standard component of a node comparison result
 */
export class NodeComparisonDatum {
  /**
   * Create a node comparison result piece
   * @param index
   * @param status
   * @param search
   * @param value
   * @param score
   */
  constructor (index, status, search, value, score) {
    debug && console.log("NodeComparisonDatum:", index, status, search, value, score);
    // validate
    if (!(index != undefined && index >= 0)) {
      throw new Error("invalid-index");
    }
    if (!(status != undefined && _.contains(_.values(NodeComparisonDatumResult), status))) {
      throw new Error("invalid-status");
    }
    
    // Valid
    this.index  = index;
    this.status = status;
    this.search = search;
    this.value  = value;
    this.score  = score || 0;
  }
}