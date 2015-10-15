/**
 * Template Helpers
 */
Template.AdventureLogTable.helpers({
  messages: function () {
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
    limit += 5;
    instance.limit.set(limit);
  },
  "click .btn-load-all": function (e, instance) {
    instance.limit.set(-1);
  }
});

/**
 * Template Created
 */
Template.AdventureLogTable.created = function () {
  var instance = this,
    params = Router.current().params.query;

  console.log("Params: ", params);

  // initialize the reactive variables
  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(params.limit ? parseInt(params.limit) : 100);

  // setup the messages data
  instance.messages = function() {
    //return Template.instance().messages().find({"context.adventureId": this._id}, {sort: {time: -1}});
    return LogMessages.find({
      "context.adventureId": instance.data._id
    }, {
      sort: { time: -1 },
      limit: instance.loaded.get()
    });
  };

  // React to limit changes
  instance.autorun(function () {
    // grab the limit
    var limit = instance.limit.get();
    console.log("Loading [", limit, "] messages");

    // Update the subscription
    var subscription = instance.subscribe("adventure_log", instance.data._id, limit);

    if(subscription.ready()){
      if(limit > 0){
        instance.loaded.set(limit);
      } else {
        var count = LogMessages.find({"context.adventureId": instance.data._id}).count();
        console.log("Limit:", limit, "Count:", count);
        instance.loaded.set(count);
      }
    }
  });
};

/**
 * Template Rendered
 */
Template.AdventureLogTable.rendered = function () {
  var instance = this;

};
