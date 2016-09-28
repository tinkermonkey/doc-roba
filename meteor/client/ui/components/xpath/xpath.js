import './xpath.html';
import { Template } from 'meteor/templating';
var parser     = require('js-xpath'),
    xPathTypes = _.keys(parser.yy.xpathmodels).filter((key) => {
      return typeof parser.yy.xpathmodels[ key ] == "function"
    });

function getXPathType (item) {
  try {
    return xPathTypes.filter((type) => {
      return item instanceof parser.yy.xpathmodels[ type ]
    })[ 0 ]
  } catch (e) {
    console.error("Failed to identify xPathType: ", item, e);
  }
}

/**
 * Identify the correct sub-template for an xPath element
 */
Template.registerHelper("xPathTemplate", function () {
  let context = this;
  //console.log("xPathTemplate[", getXPathType(context), "]:", context);
  return getXPathType(context)
});

/**
 * Xpath Helpers
 */
Template.Xpath.helpers({
  steps(){
    if(this && this.length){
      try {
        let steps = parser.parse(this).steps;
        steps.forEach((step, i) => {
          if(i > 0 && steps[i-1].axis != "descendant-or-self"){
            step.showDivider = true;
          }
        });
        return steps
      } catch (e) {
        console.error("Failed to parse Xpath: ", this, e);
      }
    }
  }
});

/**
 * XPathStep Helpers
 */
Template.XPathStep.helpers({
  stepElements(){
    let step = this;
    if (step.axis == "descendant-or-self") {
      return [
        { cssClass: "xpath-plain", text: '//' }
      ]
    } else if (step.axis == "child") {
      let elements = [];
      if(step.showDivider){
        elements.push({ cssClass: "xpath-plain", text: '/' })
      }
      elements.push({ cssClass: "xpath-tag", text: step.name ? step.name : step.test });
      return elements
    } else if (step.axis == "attribute") {
      return [
          { cssClass: "xpath-attr", text: '@' + (step.name ? step.name : step.test) }
          ];
    } else if (step.axis == "self") {
      return [
          { cssClass: "xpath-attr", text: step.toXPath() }
          ];
    } else {
      console.error("Unknown XPathStep axis: ", step.axis, step);
    }
  }
});
