/**
 * Template Helpers
 */
Template.EditNodeUrlParameterList.helpers({
  indexedUrlParameters: function () {
    var indexedParams = _.map(this.urlParameters, function (r, i) {r.index = i; return r; });
    return _.sortBy(indexedParams, function (r) { return r.order });
  },
  dataKeyParam: function () {
    return "urlParameters." + this.index + ".param";
  },
  dataKeyValue: function () {
    return "urlParameters." + this.index + ".value";
  }
});

/**
 * Template Event Handlers
 */
Template.EditNodeUrlParameterList.events({});

/**
 * Template Created
 */
Template.EditNodeUrlParameterList.created = function () {
  
};

/**
 * Template Rendered
 */
Template.EditNodeUrlParameterList.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.EditNodeUrlParameterList.destroyed = function () {
  
};
