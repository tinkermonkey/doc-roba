/**
 * Simple class to convert an error to a plain object
 */
var RobaError = function (error) {
  var robaError = this;

  try {
    robaError.message = error.message;
    robaError.arguments = error.arguments;
    robaError.type = error.type;
    robaError.name = error.name;
    robaError.stack = error.stack;

    // clean things up a bit
    if(robaError.message){
      robaError.message = robaError.message.replace(/[\r\n]/g, '<br>');
    }
    if(robaError.stack){
      robaError.stack = robaError.stack.replace(/[\r\n]/g, '<br>');
      // remove ansi characters
      // http://stackoverflow.com/questions/25245716/remove-all-ansi-colors-styles-from-strings
      robaError.stack = robaError.stack.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    }
  } catch(e) {
    console.error("RobaError constructor failed: " + e.toString());
  }

  return robaError;
};

/**
 * Export the class
 * @type {Function}
 */
module.exports = RobaError;