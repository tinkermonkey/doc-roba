/**
 * Template Helpers
 */
Template.AdventureLogEmbedded.helpers({});

/**
 * Template Helpers
 */
Template.AdventureLogEmbedded.events({});

/**
 * Template Rendered
 */
Template.AdventureLogEmbedded.created = function () {
  console.log("Embedded log: ", this.data.adventure._id);
  this.subscribe("adventure_log", this.data.adventure._id);
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
