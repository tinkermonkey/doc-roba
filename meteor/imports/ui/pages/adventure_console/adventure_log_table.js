/**
 * Template Helpers
 */
Template.AdventureLogTable.helpers({
  messages () {
    var filter = Template.instance().filter.get();
    return Template.instance().messages();
  },
  unfilteredMessages () {
    return LogMessages.find({
      "context.adventureId": FlowRouter.getParam("adventureId")
    });
  },
  hasMoreMessages () {
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
  "click .btn-load-more" (e, instance) {
    var limit = instance.limit.get();
    instance.limit.set(limit + 5);
  },
  "click .btn-load-all" (e, instance) {
    instance.limit.set(-1);
  },
  "edited .editable" (e, instance, newValue) {
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
Template.AdventureLogTable.onCreated( () =>  {
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

    // setup the query for the time filter
    if(filter.time && (filter.time.start != null || filter.time.end != null)){
      query.time = {};
      if(filter.time.start != null){
        query.time["$gt"] = filter.time.start;
      }
      if(filter.time.end != null){
        query.time["$lt"] = filter.time.end;
      }
    }

    // setup the query for the level and sender filters
    if(filter.level && filter.level.length){
      query.level = {$in: filter.level}
    }
    if(filter.sender && filter.sender.length){
      query.sender = {$in: filter.sender}
    }

    console.log("AdventureLogTable messages: ", filter, query);
    return LogMessages.find(query, {
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
        var count = LogMessages.find({"context.adventureId": adventureId}).count();
        //console.log("Limit:", limit, "Count:", count);
        instance.loaded.set(count);
      }
    }
  });
};

/**
 * Template Rendered
 */
Template.AdventureLogTable.onRendered( () =>  {
};
