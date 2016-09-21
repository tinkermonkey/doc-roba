import { ReactiveVar } from 'meteor/reactive-var';

var debug = false;

export class HighlightElementContext {
  /**
   * Context for a highlighted element in the Adventure Screen
   */
  constructor (instance, adventureContext) {
    this.instance = instance;
    
    // Create the set of reactive vars
    this.adventureContext = adventureContext;
    this.selectedElements = new ReactiveVar([]);
    this.inputText        = new ReactiveVar();
    this.checkResult      = new ReactiveVar();
  }
}