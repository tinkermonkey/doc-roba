/**
 * Template helpers
 */
Template.AdventurePreviewElement.helpers({
  getFirstArg: function () {
    if(this.preview && this.preview.args){
      return this.preview.args[0];
    }
  }
});

/**
 * Event Handlers
 */
Template.AdventurePreviewElement.events({
  "click .adventure-preview-element": function (e, instance) {
    var element = $(e.target),
      detail = $("#adventure-preview-detail-" + instance.data.index);

    if(element.hasClass("active")){
      element.removeClass("active");
      detail.removeClass("active");
    } else {
      // clear the currently active
      $(".adventure-preview-element.active").removeClass("active");
      $(".adventure-highlight-detail.active").removeClass("active");
      element.addClass("active");
      detail.addClass("active");
    }
  }
});
