import { NodeComparitor } from '../../../api/platform_type/node_comparitor.js';
import { Util } from '../../../api/util.js';

export class WebNodeComparitor extends NodeComparitor {
  constructor () {
    super();
  }
  
  /**
   * Check to see if a node matches the context
   * @param context The current adventure state or similar context
   * @param node The node to compare
   */
  compareNode (context, node) {
    // check the local locationIdentifier
    if (context && node) {
      let self   = this,
          result = new NodeSearchResultNode(node);
      result.addComparison('url', self.compareUrl(context, node));
      result.addComparison('params', self.compareParams(context, node));
      result.addComparison('pageTitle', self.comparePageTitle(context, node));
      return result;
    } else {
      console.error("compareNode check failed due to missing data:", context, node);
    }
  }
  
  /**
   * Compare a node to a url
   * @param context
   * @param node
   */
  compareUrl (context, node) {
    let contextUrl    = context.url || '',
        nodeUrl       = node.url || '',
        contextPieces = Util.urlPath(contextUrl).split("/").filter((piece) => {
          return piece.length
        }),
        nodePieces    = Util.urlPath(nodeUrl).split("/").filter((piece) => {
          return piece.length
        });
    
    return this.orderedComparison(contextPieces, nodePieces);
  }
  
  /**
   * Compare a node to a url
   * @param context
   * @param node
   */
  compareParams (context, node) {
    let contextParams = Util.urlParams(context.url || ''),
        nodeParams    = node.urlParameters || [];
    
    return this.unOrderedComparison(contextParams, nodeParams, WebNodeComparitor.containsUrlParam);
  }
  
  /**
   * Compare a page title to a node page title
   * @param context
   * @param node
   */
  comparePageTitle (context, node) {
    return this.compareText(context.title, node.pageTitle);
  }
  
  /**
   * Check if a param list contains a param
   * @param paramList
   * @param searchParam
   */
  static containsUrlParam (paramList, searchParam) {
    let match = _.find(paramList, (compareParam) => {
      if (searchParam.name && searchParam.value) {
        return compareParam.name == searchParam.name && compareParam.value == searchParam.value
      } else {
        return compareParam.name == searchParam.name
      }
    });
    return match != undefined;
  }
}