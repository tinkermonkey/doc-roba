import './remote_screen_pointer.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.RemoteScreenPointer.helpers({
  /**
   * Get the local coordinates of the remove mouse
   */
  mousePosition () {
    let viewport = this.viewport.get(),
        state    = this.state.get(),
        coords;
    if (state && state.mouse && state.mouse.x >= 0 && viewport && state.viewportSize) {
      let remoteViewport = state.viewportSize,
          ratio          = (viewport.width / remoteViewport.width),
          adjust         = viewport.parentOffset;
      
      coords = {
        x: parseInt(state.mouse.x * ratio + adjust.left),
        y: parseInt(state.mouse.y * ratio + adjust.top)
      };
      
    }
    return coords;
  }
});

/**
 * Template Event Handlers
 */
Template.RemoteScreenPointer.events({});

/**
 * Template Created
 */
Template.RemoteScreenPointer.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.RemoteScreenPointer.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.RemoteScreenPointer.onDestroyed(() => {
  
});
