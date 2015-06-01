/**
 * AdventureAddNodeForm
 *
 * Created by austinsand on 4/9/15
 *
 */

/**
 * Template Helpers
 */
Template.AdventureAddNodeForm.helpers({
  record: function () {
    return Template.instance().nodeRecord.get();
  },
  splitUrl: function () {
    if(this.state && this.state.url){
      var pieces = [];
      _.each(Util.urlPath(this.state.url).split("/"), function (part, i) {
        if(part.length){
          pieces.push({
            index: i,
            value: part
          });
        }
      });
      return pieces;
    }
  },
  splitParams: function () {

  },
  splitTitle: function () {
    if(this.state && this.state.title){
      var pieces = [];
      _.each(this.state.title.split(/\s/), function (part, i) {
        if(part.trim().length){
          pieces.push({
            index: i,
            value: part
          });
        }
      });
      return pieces;
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureAddNodeForm.events({
  "click .url-part.clickable": function (e, instance) {
    $(e.target).toggleClass("selected");

    var selection = [], oneSelected = false;
    instance.$(".url-part").each(function (i, part) {
      selection.push($(part).hasClass("selected") ? $(part).attr("data-value") : "*");
      oneSelected = oneSelected || $(part).hasClass("selected");
    });

    if(!oneSelected){
      selection = [];
    }

    var record = instance.nodeRecord.get();
    record.url = selection.length ? "/" + selection.join("/") : null;
    instance.nodeRecord.set(record);
  },
  "click .title-part.clickable": function (e, instance) {
    $(e.target).toggleClass("selected");

    var selection = [], oneSelected = false, selected, lastSelected = true;
    instance.$(".title-part").each(function (i, part) {
      selected = $(part).hasClass("selected");
      if(selected || lastSelected){
        selection.push(selected ? $(part).attr("data-value") : "*");
      }
      oneSelected = oneSelected || selected;
      lastSelected = selected;
    });

    if(!oneSelected){
      selection = [];
    }


    var record = instance.nodeRecord.get();
    record.pageTitle = selection.join(" ");
    instance.nodeRecord.set(record);
  },
  "click .url-param.clickable": function (e, instance) {
    $(e.target).toggleClass("selected");

    var selection = [];
    instance.$(".param-part").each(function (i, part) {
      //console.log("url-part: ", i, $(part).attr("data-value"), $(part).hasClass("selected"));
      selection.push({
        order: i,
        value: $(part).hasClass("selected") ? $(part).attr("data-value") : null
      });
    });

    var record = instance.nodeRecord.get();
    record.urlParams = selection;
    instance.nodeRecord.set(record);
  },
  "click .btn-select-parent": function (e, instance) {
    instance.data.showSearch.set(true);
    $(".adventure-map-container").addClass("show-parent-search");
    try{
      var mapInstance = Blaze.getView($(".map-tree-base").get(0)).templateInstance(),
        finalWidth = mapInstance.$(".map-tree-base").width(),
        finalHeight = Math.max($(".adventure-map-container").closest(".row").height() / 2, 300);
      mapInstance.mapLayout.transitionZoomAll(finalWidth, finalHeight, 250);
      mapInstance.mapLayout.hideLocationUnknown();
    } catch (e) {
      Meteor.log.error("Failed to locate map container: " + e.message);
    }

    // focus on the search field
    setTimeout(function () {
      $(".input-search").focus();
    }, 500);
  },
  "edited .editable": function (e, instance, newValue) {
    var field = $(e.target).attr("data-key");
    console.log("Edited: ", field, newValue);

    var record = instance.nodeRecord.get();
    record[field] = newValue;
    instance.nodeRecord.set(record);

    if(field == "url"){
      instance.$(".url-part").removeClass("selected");
    } else if (field == "pageTitle") {
      instance.$(".title-part").removeClass("selected");
    }
  }
});

/**
 * Template Created
 */
Template.AdventureAddNodeForm.created = function () {
  this.nodeRecord = new ReactiveVar({
    parentId: this.data.adventure.lastKnownNode,
    projectId: this.data.adventure.projectId,
    projectVersionId: this.data.adventure.projectVersionId,
    type: NodeTypes.page,
    title: "",
    pageTitle: "",
    url: "",
    urlParams: []
  });
};

/**
 * Template Rendered
 */
Template.AdventureAddNodeForm.rendered = function () {
  var instance = Template.instance();

  instance.autorun(function () {
    var record = instance.nodeRecord.get(),
      visible = $(instance.firstNode).is(":visible");
    if(record.parentId && visible){
      try{
        console.log("AddNodeForm autoRun");
        var mapInstance = Blaze.getView($(".map-tree-base").get(0)).templateInstance();
        mapInstance.mapLayout.highlightNodes([record.parentId]);
      } catch (e) {
        Meteor.log.error("Failed to locate map container: " + e.message);
      }
    }
  });
};

/**
 * Template Destroyed
 */
Template.AdventureAddNodeForm.destroyed = function () {

};
