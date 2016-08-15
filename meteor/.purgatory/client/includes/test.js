/**
 * Template Helpers
 */
Template.test.helpers({
  screenShots: function () {
    return Collections.Screenshots.find();
  }
});

/**
 * Template Event Handlers
 */
Template.test.events({
  'change .myFileInput': function(e, instance) {
    var files = e.target.files;
    for (var i = 0, ln = files.length; i < ln; i++) {

      var newFile = new FS.File(files[i]);
      newFile.owner = Meteor.user().username;

      Collections.Screenshots.insert(newFile, function (error, fileObj) {
        if(error){
          console.error("Upload failed: ", error);
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.test.created = function () {
  
};

/**
 * Template Rendered
 */
Template.test.rendered = function () {
  
};

/**
 * Template Destroyed
 */
Template.test.destroyed = function () {
  
};
