/**
 * Template Helpers
 */
Template.edit_node_url_parameters.helpers({
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
 * Template Helpers
 */
Template.edit_node_url_parameters.events({});

/**
 * Template Rendered
 */
Template.edit_node_url_parameters.rendered = function () {
  var instance = Template.instance();

  // Make the field list sortable
  instance.$(".sortable-table")
    .sortable({
      items: "> tbody > .sortable-table-row",
      handle: ".drag-handle",
      helper: function(e, ui) {
        // fix the width
        ui.children().each(function() {
          $(this).width($(this).width());
        });
        return ui;
      },
      axis: "y",
      update: function (event, ui) {
        var update = {$set: {}},
          updateKey;

        instance.$(".node-url-parameter").each(function (i, el) {
          updateKey = "urlParameters." + parseInt($(el).attr("data-index")) + ".order";
          update["$set"][updateKey] = i;
        });

        console.log("Update pre-send: ",  instance.data._id, update);
        Nodes.update( instance.data._id, update, function (error) {
          if(error){
            Meteor.log.error("Node url parameter order update failed: " + error.message);
            Dialog.error("Node url parameter order update failed: " + error.message);
          }
        });

        instance.$(".sortable-table").sortable("cancel");
      }
    })
    .disableSelection();
};

/**
 * Template Destroyed
 */
Template.edit_node_url_parameters.destroyed = function () {

};
