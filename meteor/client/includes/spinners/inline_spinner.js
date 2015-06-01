/**
 * Template Helpers
 */
Template.inline_spinner.helpers({
  getSize: function () {
    var scale = this.scale || 1;
    return parseInt(scale * 120);
  }
});
