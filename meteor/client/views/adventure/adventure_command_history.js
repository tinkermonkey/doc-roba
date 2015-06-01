/**
 * Helpers
 */
Template.AdventureCommandHistory.helpers({
  getCommands: function () {
    if(this.adventure._id){
      var count = Template.instance().historyLength.get();
      return AdventureCommands.find({ adventureId: this.adventure._id }, {sort:{dateCreated: -1}});
    }
  },
  formatResult: function () {
    if(this.result){
      return JSON.stringify(this.result, null, "\t").substring(0, 150);
    }
  },
  complete: function () {
    return this.status == AdventureStepStatus.complete || Date.now() - this.dateCreated > 20000;
  }
});

/**
 * Event Handlers
 */
Template.AdventureCommandHistory.events({
  "click .result-toggle": function (e) {
    var expanded = $(e.target).parent().hasClass("expanded");
    if(!expanded){
      $(e.target).parent().addClass("expanded");
      $(e.target).removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
    } else {
      $(e.target).parent().removeClass("expanded");
      $(e.target).removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    }
  },
  "click .btn-copy-command": function (e, instance) {
    var result = this;
    console.log("Copy command: ", result.code);

    // find the editor
    try {
      var editorInstance = Blaze.getView($(".command-editor").get(0)).templateInstance();

      editorInstance.editor.insert(result.code);
    } catch (e) {
      Meteor.log.error("Failed to insert command in editor: " + e.message);
      Dialog.error("Failed to insert command in editor: " + e.message);
    }
  }
});

Template.AdventureCommandHistory.created = function () {
  this.historyLength = new ReactiveVar(10);
};