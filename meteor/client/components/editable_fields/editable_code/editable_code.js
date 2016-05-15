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
    return;

    console.log("Node: ", $(e.target).closest(".code,.empty-text").get(0));

    //if(instance.data.popup){
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
              console.error("Failed to get EditableCode.editor");
              Dialog.error("Failed to get EditableCode.editor");
            }
          }
          Popover.hide();
        }
      });
    /*
    } else {
      $(e.target).closest(".code,.empty-text").toggleClass("hide");
      var context = instance.data;
      context.minLines = 10;
      context.maxLines = 30;
      Blaze.renderWithData(Template.RobaAce, context, instance.$(".editable-code").get(0));
    }
    */
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

  instance.$(".editable").editable({
    type: "editableAce",
    mode: instance.data.mode || "popup",
    placement: instance.data.placement || "auto",
    data: instance.data,
    parentInstance: instance,
    highlight: false,
    onblur: "ignore",
    display: function () {},
    success: function (response, newValue) {
      var editedElement = this;
      $(editedElement).trigger("edited", [newValue]);
      setTimeout(function () {
        $(editedElement).removeClass('editable-unsaved');
      }, 10);
    }
  });

  // this event listener needs to be registered directly
  instance.$(".editable").on("hidden", function(e, reason) {
    if(instance.formView){
      setTimeout(function () {
        Blaze.remove(instance.formView);
      }, 100);
    }
  });

  // watch for data changes and re-render
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
