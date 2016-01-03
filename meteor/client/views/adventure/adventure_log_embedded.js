/**
 * Template Helpers
 */
Template.AdventureLogEmbedded.helpers({
  messages: function () {
    var instance = Template.instance();
    return Collections.LogMessages.find({
      "context.adventureId": instance.data._id
    }, {
      sort: { time: -1 },
      limit: 1000
    });
  }
});

/**
 * Template Helpers
 */
Template.AdventureLogEmbedded.events({});

/**
 * Template Rendered
 */
Template.AdventureLogEmbedded.created = function () {
  var instance = this;

  instance.autorun(function () {
    instance.subscribe("adventure_log", instance.data.adventure._id);
  });
};

/**
 * Template Rendered
 */
Template.AdventureLogEmbedded.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.AdventureLogEmbedded.destroyed = function () {

};
