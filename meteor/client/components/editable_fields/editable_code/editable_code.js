/**
 * Template Helpers
 */
Template.EditableCode.helpers({
});

/**
 * Template Event Handlers
 */
Template.EditableCode.events({
  "click .code, click .empty-text": function (e, instance) {
    console.log("Node: ", $(e.target).closest(".code,.empty-text").get(0));
    Popover.show({
      contentTemplate: "EditableCodeEditor",
      contentData: instance.data,
      sourceElement: $(e.target).closest(".code,.empty-text").get(0),
      placement: "auto",
      size: "maximize",
      buttons: [
        { text: "Cancel" },
        { text: "Save" }
      ],
      callback: function (btn, popover) {
        console.log("Popover Closed: ", btn);
        if(btn && btn.toLowerCase() == "save"){
          var editor = Blaze.getView(popover.$(".roba-ace").get(0)).templateInstance().editor;
          if(editor){
            instance.$(".editable-code").trigger("edited", [editor.getValue() || ""]);
          } else {
            Meteor.log.error("Failed to get EditableCode.editor");
            Dialog.error("Failed to get EditableCode.editor");
          }
        }
        Popover.hide();
      }
    });
  }
});

/**
 * Template Created
 */
Template.EditableCode.created = function () {
  
};

/**
 * Template Rendered
 */
Template.EditableCode.rendered = function () {
  var instance = this;
  instance.autorun(function () {
    var data = Template.currentData();
    if(data.value){
      instance.$('.code').html(data.value);
      //instance.$('.code').html(data.value.split(/[\r\n]/g).join('<br>'));
    }
    instance.$('.code').each(function(i, block) {
      hljs.highlightBlock(block);
    });
  });
};

/**
 * Template Destroyed
 */
Template.EditableCode.destroyed = function () {
  
};
