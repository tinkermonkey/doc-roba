/**
 * Template Helpers
 */
Template.AdventureEditNodeActionRow.helpers({
  actionWithScale: function () {
    this.scale = 0.5;
    return this;
  },
  getAdventureContext: function () {
    var i = 0, context = Template.parentData(i);
    while(i < 10 && context){
      context = Template.parentData(i++);
      if(context.adventure){
        return context;
      }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdventureEditNodeActionRow.events({
  "click .btn-edit-action": function (e, instance) {
    var action = this,
      formRow = $(e.target).closest("tr").next();
    if(formRow.hasClass("hide")){
      formRow.removeClass("hide");
      Blaze.renderWithData(Template.AdventureEditActionForm, action, formRow.find("td").get(0));
      $(e.target).attr("disabled", "disabled");
    }
  }
});

/**
 * Template Created
 */
Template.AdventureEditNodeActionRow.created = function () {
  
};

/**
 * Template Rendered
 */
Template.AdventureEditNodeActionRow.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.AdventureEditNodeActionRow.destroyed = function () {
  
};
