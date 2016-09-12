import './pretty_code.html';
import { Template } from 'meteor/templating';
import '../../../../node_modules/prismjs/themes/prism.css';
var Prism = require('prismjs');

/**
 * Template Helpers
 */
Template.PrettyCode.helpers({
  getLanguage(){
    return this.language || "javascript"
  }
});

/**
 * Template Event Handlers
 */
Template.PrettyCode.events({});

/**
 * Template Created
 */
Template.PrettyCode.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.PrettyCode.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(function () {
    let data = Template.currentData(),
        language = data.language || 'javascript';
    if (data.value) {
      instance.$('.code').html(Prism.highlight(data.value, Prism.languages[language]));
    }
  });
});

/**
 * Template Destroyed
 */
Template.PrettyCode.onDestroyed(() => {
  
});
