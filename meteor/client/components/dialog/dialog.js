/**
 * Some helpers for working with size and position
 */
Template.dialog.helpers({
  getPosition: function () {
    var position;

    // if the dialog should be centered, handle that
    if(this.centered){
      // render off-screen and then show the content
      position = "left: -10000px; max-width: " + this.maxWidth + ";";
    } else {
      // if position is specified, use it
      if (this.left && this.top) {
        position = "top:" + parseInt(this.top) + "px; left:" + parseInt(this.left) + "px; margin: 0px;";
      } else {
        // otherwise center it
        position = "top:50%; left:50%; margin-left:-" + (this.width / 2) + "px; margin-top:-150px;";
      }
    }

    // if width is specified, use it
    if (this.width) {
      position += "width:" + parseInt(this.width) + "px;";
    }

    return position;
  }
});

/**
 * Pick up the button click and try to hand off to a callback
 */
Template.dialog.events({
  "click .button-bar button": function (event, dialog) {
    var btn = $(event.target).text(),
      instance = Template.instance();

    console.debug("Dialog button clicked: " + btn);
    $(dialog.firstNode).remove();
    if (instance.data.callback) {
      instance.data.callback(btn);
    }
  }
});

/**
 * Handle the dialog being rendered
 */
Template.dialog.rendered = function () {
  var instance = Dialog.currentInstance = Template.instance(),
    dialog = instance.$(".dialog");

  if(instance.data.centered){
    //console.log("Showing centered dialog");

    // render off-screen and then show the content
    dialog
      .hide()
      .css("left", "50%")
      .css("top", "50%")
      .css("margin-left", -1 * dialog.outerWidth() / 2)
      .css("margin-top",  -1 * (dialog.outerHeight() > window.innerHeight ? window.innerHeight / 2 - 20 : dialog.outerHeight() / 2));

    // fade in if it's not visible
    if(dialog.css("display") === "none"){
      //console.log("fade in: ", dialog.css("display"), dialog);
      dialog.fadeIn(250);
    }

    instance.autorun(function () {
      // This should re-run if the window height changes
      var resize = Session.get("resize");

      dialog
        .css("margin-left", -1 * dialog.outerWidth() / 2)
        .css("margin-top",  -1 * (dialog.outerHeight() > window.innerHeight ? window.innerHeight / 2 - 20 : dialog.outerHeight() / 2));
    })
  }
};

/**
 * Create a singleton for interacting with the dialogs
 * There will only be one visible at a time
 * @type {{}}
 */
Dialog = {
  /**
   * Show a modal dialog
   * @param template The template showing the content
   * @param options
   */
  show: function (options) {
    // Combine the options with the defaults
    _.defaults(options, {
      contentTemplate: "default_dialog",
      contentData: { text: "Are you sure?" },
      width: 400,
      maxWidth: '80%',
      title: "Please Confirm",
      modal: true,
      centered: true,
      buttons: [
        { text: "Cancel" },
        { text: "OK" }
      ],
      callback: function (btn) {
        console.log("Dialog button pressed: ", btn);

        Dialog.hide(function () {
          console.log("Dialog hidden");
        });
      }.bind(this)
    });

    // automagically carry text from the options to the template data
    if(options.text)
      options.contentData.text = options.text;

    Blaze.renderWithData(Template.dialog, options, $("body")[0]);
  },

  /**
   *
   * @param title
   * @param text
   * @param okCallback Callback function to execute if the OK button is pressed
   */
  ask: function (title, text, okCallback) {
    Dialog.show({
      contentData: { text: text },
      title: title,
      callback: function (btn) {
        Dialog.hide();
        if(btn == "OK"){
          if(okCallback) {
            okCallback();
          };
        }
      }
    });
  },

  /**
   * Hide the dialog and call a function upon completion
   * @param callback
   */
  hide: function (callback) {
    if(Dialog.currentInstance){
      var dialog = $(".dialog"),
        screen = $(".dialog-screen");

      // Fade out and destroy the template
      //var view = Blaze.getView(Dialog.currentInstance.view);
      screen.fadeOut(250);
      dialog.fadeOut(250, function () {
        Blaze.remove(Dialog.currentInstance.view);
        delete Dialog.currentInstance;

        if(callback){
          callback();
        }
      });
    }
  },

  /**
   * Show a standard error dialog
   */
  error: function (message, callback) {
    Dialog.show({
      title: "Error",
      text: message,
      width: 400,
      buttons: [
        {text: "Lame"}
      ],
      callback: callback || function (btn) {
        Dialog.hide();
      }
    });
  }
};
