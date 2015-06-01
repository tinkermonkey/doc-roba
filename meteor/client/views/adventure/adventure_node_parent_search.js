/**
 * AdventureNodeParentSearch
 *
 * Created by austinsand on 5/2/15
 *
 */

/**
 * Template Helpers
 */
Template.AdventureNodeParentSearch.helpers({
  searchResults: function () {
    var instance = Template.instance();
    return instance.searchResults.get();
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureNodeParentSearch.events({
  "click .btn-search": function (e, instance) {

  },
  "click .btn-cancel": function (e, instance) {
    instance.data.showSearch.set(false);
    $(".input-search").val("");
    instance.searchResults.set();
    $(".adventure-map-container").removeClass("show-parent-search");

    // update the map view
    try {
      var mapInstance = Blaze.getView($(".map-tree-base").get(0)).templateInstance(),
        finalWidth = mapInstance.$(".map-tree-base").width(),
        finalHeight = Math.max($(".adventure-map-container").closest(".row").height() / 3, 300);
      mapInstance.mapLayout.transitionZoomAll(finalWidth, finalHeight, 250);
      mapInstance.mapLayout.showLocationUnknown();
      mapInstance.mapLayout.clearHighlight();

      var formInstance = Blaze.getView($(".btn-select-parent").get(0)).templateInstance(),
        record = formInstance.nodeRecord.get();
      mapInstance.mapLayout.highlightNodes([record.parentId]);
    } catch (e) {
      Meteor.log.error("Failed to locate map container: " + e.message);
    }
  },
  "keyup .input-search, change .input-search": function (e, instance) {
    e.stopImmediatePropagation();
    var term = instance.$(".input-search").val();
    instance.searchResults.set(NodeSearch.byTerm(term, instance.data.adventure.projectVersionId));
  },
  "dblclick .node-search-icon": function (e, instance) {
    e.stopImmediatePropagation();
    var result = this;

    if(!result.node){
      return;
    }

    instance.data.showSearch.set(false);
    $(".input-search").val("");
    instance.searchResults.set();
    $(".adventure-map-container").removeClass("show-parent-search");

    // update the map view
    try {
      var mapInstance = Blaze.getView($(".map-tree-base").get(0)).templateInstance(),
        finalWidth = mapInstance.$(".map-tree-base").width(),
        finalHeight = Math.max($(".adventure-map-container").closest(".row").height() / 3, 300);
      mapInstance.mapLayout.transitionZoomAll(finalWidth, finalHeight, 250);
      mapInstance.mapLayout.showLocationUnknown();
      mapInstance.mapLayout.clearHighlight();
    } catch (e) {
      Meteor.log.error("Failed to locate map container: " + e.message);
    }

    // update the add node form
    try {
      console.log("dblclick .node-search-icon, setting record: ", result.node.staticId);
      var formInstance = Blaze.getView($(".btn-select-parent").get(0)).templateInstance(),
        record = formInstance.nodeRecord.get();
      record.parentId = result.node.staticId;
      // need to make sure the form is visible when we set the record
      setTimeout(function () {
        formInstance.nodeRecord.set(record);
      }, 100);
    } catch (e) {
      Meteor.log.error("Failed to locate form container: " + e.message);
    }
  }
});

/**
 * Template Created
 */
Template.AdventureNodeParentSearch.created = function () {
  var instance = Template.instance();
  instance.searchResults = new ReactiveVar([]);
};

/**
 * Template Rendered
 */
Template.AdventureNodeParentSearch.rendered = function () {
  var instance = Template.instance(), mapInstance;

  instance.autorun(function () {
    var resultList = instance.searchResults.get(),
      results = [];

    // Grab just the nodes
    _.each(resultList, function (result) {
      results.push(result.node);
    });

    try {
      var mapInstance = Blaze.getView($(".map-tree-base").get(0)).templateInstance();
    } catch (e) {
      Meteor.log.error("Failed to locate map container: " + e.message);
    }

    if(mapInstance && mapInstance.mapLayout){
      if(results.length){
        mapInstance.mapLayout.highlightNodes(results);
      } else {
        mapInstance.mapLayout.clearHighlight();
      }
    }
  });
};

/**
 * Template Destroyed
 */
Template.AdventureNodeParentSearch.destroyed = function () {

};
