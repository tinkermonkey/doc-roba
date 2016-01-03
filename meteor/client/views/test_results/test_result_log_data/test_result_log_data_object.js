/**
 * Template Helpers
 */
Template.TestResultLogDataObject.helpers({
  getKeys: function () {
    return _.keys(this)
  },
  getKeyValue: function (key, data) {
    // force it to display zeros which other fail in the with clause
    var value = data[key];
    if(_.isNumber(value)){
      return value.toString();
    }
    return value;
  }
});

/**
 * Template Event Handlers
 */
Template.TestResultLogDataObject.events({
  "click .log-data-object-expander": function (e, instance) {
    e.stopImmediatePropagation();
    var expander = $(e.target).closest(".log-data-object-expander"),
      expandee = expander.next();

    if(expandee.is(":visible")){
      //expandee.hide('slide',{direction:'left'}, 400)
      expandee.hide();
    } else {
      //expandee.show('slide',{direction:'right'}, 400)
      expandee.show();
    }
    expander.find(".glyphicon").toggleClass("glyphicon-arrow-right");
    expander.find(".glyphicon").toggleClass("glyphicon-arrow-left");
  }
});

/**
 * Template Created
 */
Template.TestResultLogDataObject.created = function () {
  
};

/**
 * Template Rendered
 */
Template.TestResultLogDataObject.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.TestResultLogDataObject.destroyed = function () {
  
};
