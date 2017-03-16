import { NodeComparitor } from '../../../api/platform_types/node_comparitor.js';
import { NodeComparison } from '../../../api/platform_types/node_comparison.js';
import { NodeSearchResult } from '../../../api/platform_types/node_search_result.js';
import { Util } from '../../../api/util.js';

var debug = false;

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
    debug && console.log("WebNodeComparitor.compareNode:", context, node);
    // check the local locationIdentifier
    if (context && node) {
      let self   = this,
          result = new NodeSearchResult(node);
      result.addComparison('url', self.compareUrl(context, node));
      result.addComparison('urlParameters', self.compareParams(context, node));
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
    debug && console.log("WebNodeComparitor.compareUrl:", context, node);
    let contextUrl    = context.url || '',
        nodeUrl       = node.url || '',
        contextPieces = Util.urlPath(contextUrl).split("/").filter((piece) => {
          return piece.length > 0
        }),
        nodePieces    = nodeUrl.split("/").filter((piece) => {
          return piece.length > 0
        });
    return new NodeComparison(contextUrl, nodeUrl).orderedComparison(contextPieces, nodePieces);
  }
  
  /**
   * Compare a node to a url
   * @param context
   * @param node
   */
  compareParams (context, node) {
    debug && console.log("WebNodeComparitor.compareParams:", context, node);
    let contextParams = Util.urlParams(context.url || ''),
        nodeParams    = node.urlParameters || [];
    return new NodeComparison(contextParams, nodeParams)
        .unOrderedComparison(contextParams, nodeParams, WebNodeComparitor.containsUrlParam, WebNodeComparitor.uniqUrlParam);
  }
  
  /**
   * Compare a page title to a node page title
   * @param context
   * @param node
   */
  comparePageTitle (context, node) {
    debug && console.log("WebNodeComparitor.comparePageTitle:", context, node);
    return new NodeComparison(context.title, node.pageTitle).textComparison();
  }
  
  /**
   * Check if a param list contains a param
   * @param paramList
   * @param searchParam
   */
  static containsUrlParam (paramList, searchParam) {
    let match = _.find(paramList, (compareParam) => {
      if (searchParam.param && searchParam.value) {
        return compareParam.param == searchParam.param && compareParam.value == searchParam.value
      } else {
        return compareParam.param == searchParam.param
      }
    });
    debug && console.log("WebNodeComparitor.containsUrlParam:", paramList, searchParam, match);
    return match != undefined;
  }
  
  /**
   * Check if a param list contains a param
   * @param param
   */
  static uniqUrlParam (param) {
    return param.name;
  }
}