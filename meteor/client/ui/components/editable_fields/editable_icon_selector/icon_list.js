import './icon_list.html';
import { Template } from 'meteor/templating';
import { Util } from '../../../../../imports/api/util.js';
/**
 * Template Helpers
 */
Template.IconList.helpers({
  context(){
    let instance = Template.instance();
    return {
      icons       : instance.loadedIcons.get(),
      currentValue: instance.currentValue.get(),
    }
  },
  selected(currentValue){
    let cssClass = this;
    //console.log("selected:", cssClass, currentValue, cssClass == currentValue);
    return cssClass == currentValue
  }
});

/**
 * Template Event Handlers
 */
Template.IconList.events({
  "click .icon"(e, instance) {
    var selection = this.toString();
    console.log("Click: ", selection);
    instance.data.xEditable.$input.val(selection);
    instance.currentValue.set(selection);
  }
});

/**
 * Template Created
 */
Template.IconList.onCreated(() => {
  let instance          = Template.instance();
  instance.currentValue = new ReactiveVar("");
  instance.loadedIcons  = new ReactiveVar(Util.iconList());
});

/**
 * Template Rendered
 */
Template.IconList.onRendered(() => {
  var instance = Template.instance(),
      value    = instance.data.xEditable.$input.val();
  if (value) {
    instance.currentValue.set(value);
  }
});

/**
 * Template Destroyed
 */
Template.IconList.onDestroyed(() => {
  
});
