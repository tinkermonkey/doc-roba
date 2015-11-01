/**
 * Template Helpers
 */
Template.InlineSpinner.helpers({
  getSize: function () {
    var scale = this.scale || 1;
    return parseInt(scale * 120);
  }
});
