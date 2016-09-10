import './node_term_search_results.html';
import './node_search.css';

import {Template} from 'meteor/templating';

import '../svg_snippets/standalone_node_snippet.js';

/**
 * NodeTermSearchResults
 *
 * Created by austinsand on 5/3/15
 *
 */

/**
 * Template Helpers
 */
Template.NodeTermSearchResults.helpers({
  highlightTerm(param, term) {
    if(param && term){
      return param.replace(new RegExp('(' + term + ')', 'i'), '<span class="search-highlight">$1</span>');
    }
  }
});

/**
 * Template Event Handlers
 */
Template.NodeTermSearchResults.events({});

/**
 * Template Created
 */
Template.NodeTermSearchResults.created = function () {

};

/**
 * Template Rendered
 */
Template.NodeTermSearchResults.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.NodeTermSearchResults.destroyed = function () {

};
