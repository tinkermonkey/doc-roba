import './log_message_data_object.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.LogMessageDataObject.helpers({
  getKeys() {
    return _.keys(this)
  },
  getKeyValue(key, data) {
    // force it to display zeros which other fail in the with clause
    var value = data[ key ];
    if (_.isNumber(value)) {
      return value.toString();
    }
    return value;
  },
  showExpander(){
    return Template.instance().showExpander.get();
  }
});

/**
 * Template Event Handlers
 */
Template.LogMessageDataObject.events({
  "click .log-data-object-expander"(e, instance) {
    e.stopImmediatePropagation();
    var expander = $(e.target).closest(".log-data-object-expander"),
        expandee = expander.next();
    
    if (expandee.is(":visible")) {
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
Template.LogMessageDataObject.created = function () {
  let instance = Template.instance();
  instance.showExpander = new ReactiveVar(true);
};

/**
 * Template Rendered
 */
Template.LogMessageDataObject.rendered = function () {
  let instance = Template.instance();
  instance.showExpander.set($(instance.firstNode).parent().closest(".log-data-object-container").length > 0);
};

/**
 * Template Destroyed
 */
Template.LogMessageDataObject.destroyed = function () {
  
};
