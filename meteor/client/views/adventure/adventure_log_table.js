/**
 * Template Helpers
 */
Template.AdventureLogTable.helpers({
  messages: function () {
    var filter = Template.instance().filter.get();
    return Template.instance().messages();
  },
  hasMoreMessages: function () {
    var limit = Template.instance().limit.get();
    if(limit > 0){
      return Template.instance().messages().count() >= Template.instance().limit.get();
    }
  }
});

/**
 * Template Events
 */
Template.AdventureLogTable.events({
  "click .btn-load-more": function (e, instance) {
    var limit = instance.limit.get();
    instance.limit.set(limit + 5);
  },
  "click .btn-load-all": function (e, instance) {
    instance.limit.set(-1);
  },
  "edited .editable": function (e, instance, newValue) {
    console.log("Edited:", $(e.target).attr("data-key"), newValue);
    var dataKey = $(e.target).attr("data-key"),
        filter = instance.filter.get();

    filter[dataKey] = newValue;
    instance.filter.set(filter);
  }
});

/**
 * Template Created
 */
Template.AdventureLogTable.created = function () {
  var instance = this;

  // initialize the reactive variables
  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(FlowRouter.getQueryParam("limit") || 100);

  // setup the messages data
  instance.messages = function() {
    //return Template.instance().messages().find({"context.adventureId": this._id}, {sort: {time: -1}});
    var filter = instance.filter.get(),
        query = {
      "context.adventureId": FlowRouter.getParam("adventureId")
    };

    // setup the query for the filter
    if(filter.time && (filter.time.start != null || filter.time.end != null)){
      query.time = {};
      if(filter.time.start != null){
        query.time["$gt"] = filter.time.start;
      }
      if(filter.time.end != null){
        query.time["$lt"] = filter.time.end;
      }
    }

    console.log("message: ", filter, query);
    return Collections.LogMessages.find(query, {
      sort: { time: -1 },
      limit: instance.loaded.get()
    });
  };

  // setup the display filter
  instance.filter = new ReactiveVar({});

  // React to limit changes
  instance.autorun(function () {
    // grab the limit
    var limit = instance.limit.get(),
        adventureId = FlowRouter.getParam("adventureId");
    //console.log("Loading [", limit, "] messages");

    // Update the subscription
    var subscription = instance.subscribe("adventure_log", adventureId, limit);

    if(subscription.ready()){
      if(limit > 0){
        instance.loaded.set(limit);
      } else {
        var count = Collections.LogMessages.find({"context.adventureId": adventureId}).count();
        //console.log("Limit:", limit, "Count:", count);
        instance.loaded.set(count);
      }
    }
  });
};

/**
 * Template Rendered
 */
Template.AdventureLogTable.rendered = function () {
};
