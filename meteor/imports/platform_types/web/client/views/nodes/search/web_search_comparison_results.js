import './web_search_comparison_results.html';
import { Template } from 'meteor/templating';
import { NodeComparisonDatumResultLookup } from '../../../../../../api/platform_types/node_comparison_datum_result.js';

/**
 * Template Helpers
 */
Template.WebSearchComparisonResults.helpers({
  popoverText(){
    let result     = this,
        statusText = NodeComparisonDatumResultLookup[ result.status ],
        text       = '';
    
    return text;
  },
  searchOrValue(){
    return this.search || this.value
  }
});

/**
 * Template Event Handlers
 */
Template.WebSearchComparisonResults.events({
  "click .node-search-result"(e, instance){
    var data       = Template.currentData(),
        target     = $(e.target).closest('.node-search-result'),
        dataKey    = target.attr('data-key'),
        dataIndex  = target.attr('data-index'),
        item       = data.comparisons[dataKey].pieces[dataIndex],
        node       = data.node,
        dataStatus = NodeComparisonDatumResultLookup[ item.status ];
    
    console.log('click:', dataKey, dataStatus, dataIndex, item, data);
  }
});

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
  instance.autorun(() => {
    var data = Template.currentData();
    instance.$(".node-search-result").popover({
      placement: 'top',
      trigger  : 'hover',
      html     : true,
      delay    : 100
    });
  });
  
});

/**
 * Template Destroyed
 */
Template.WebSearchComparisonResults.onDestroyed(() => {
  
});
