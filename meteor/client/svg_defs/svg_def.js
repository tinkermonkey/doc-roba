/**
 * Template Helpers
 */
Template.svg_def.helpers({
  /**
   * There are real problems with this approach
   * If the original svg element with the needed definition is hidden
   * then the def disappears for all elements
   * But
   * Just duplicating defs doesn't actually fix it either
   * May have to ho with some sort of page global defs sections for the browsers that support it
   * @returns {boolean}
   */
  needed: function () {
    return true;
    // Check to see if the element is already defined
    var name = this || '',
      id = name.replace("def_", "").replace(/_/g, "-");

    // Firefox needs definitions to be made in each SVG element
    if(BrowserDetect.browser == "Firefox"){
      return true;
    }

    // On include it if it needs to be
    if(id.length){
      return d3.select("#" + id).node() === null;
    }
  },
  templateName: function () {
    var name = this || '',
      id = name.replace("def_", "").replace(/_/g, "-"),
      template = "def_" + id.replace(/\-/g, "_");
    return template;
  }
});
