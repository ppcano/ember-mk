
require("ember-mk/core");

Mk.Animation = Em.Object.extend({
  options: null, //{duration, delay, stopEventHandling, immediately}}  
  fn: null,
  callback: null, 
  view: null, 

  init: function(){
    this._super();
  }

});
