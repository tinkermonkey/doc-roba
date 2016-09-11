import {Template} from 'meteor/templating';
import {Autoform} from 'meteor/aldeed:autoform';

import './autoForm_dataStore.html';

/**
 * Addapted from bootstrap3-inline and default bootstrap3 themes
 */
Template["quickForm_dataStore"].helpers({
  labelClass() {
    return this.atts["label-class"];
  },
  idPrefix() {
    return this.atts["id-prefix"];
  },
  qfAutoFormContext() {
    var ctx = _.clone(this.qfAutoFormContext || {});
    ctx = AutoForm.Utility.addClass(ctx, "form-inline");
    if (ctx["label-class"])
      delete ctx["label-class"];
    return ctx;
  }
});

Template["afFormGroup_dataStore"].helpers({
  afFieldInputAtts() {
    var atts = _.clone(this.afFieldInputAtts || {});
    // Use the same templates as those defined for bootstrap3 template.
    atts.template = "bootstrap3";
    return atts;
  }
});
