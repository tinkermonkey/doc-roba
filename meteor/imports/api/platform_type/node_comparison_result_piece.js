import { NodeComparitorDatumResult } from './node_comparitor_datum_result.js';

/**
 * Standard component of a node comparison result
 */
export class NodeComparisonResultPiece {
  /**
   * Create a node comparison result piece
   * @param index
   * @param status
   * @param search
   * @param value
   * @param score
   */
  constructor (index, status, search, value, score) {
    // validate
    if (!(this.index !== undefined && this.index >= 0)) {
      throw new Error("invalid-index");
    }
    if (!(this.status !== undefined && _.contains(_.values(NodeComparitorDatumResult), status))) {
      throw new Error("invalid-status");
    }
    if (!(this.search !== undefined && search.length > 0)) {
      throw new Error("invalid-search");
    }
    
    // Valid
    this.index  = index;
    this.status = status;
    this.search = search;
    this.value  = value;
    this.score  = score || 0;
  }
}