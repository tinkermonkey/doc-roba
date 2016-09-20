import './web_search_comparison_results.html';
import { Template } from 'meteor/templating';
import { NodeComparisonDatumResultLookup } from '../../../../../../api/platform_type/node_comparison_datum_result.js';

/**
 * Template Helpers
 */
Template.WebSearchComparisonResults.helpers({
  popoverText(){
    let result     = this,
        statusText = NodeComparisonDatumResultLookup[ result.status ],
        text       = '';
    
    return text;
  }
});

/**
 * Template Event Handlers
 */
Template.WebSearchComparisonResults.events({});

/**
 * Template Created
 */
Template.WebSearchComparisonResults.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.WebSearchComparisonResults.onRendered(() => {
  let instance = Template.instance();
  
  // node search result explanations
  instance.$(".node-search-result").popover({
    placement: 'top',
    trigger  : 'hover',
    html     : true,
    delay    : 100
  });
  
});

/**
 * Template Destroyed
 */
Template.WebSearchComparisonResults.onDestroyed(() => {
  
});
