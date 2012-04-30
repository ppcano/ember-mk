
require("ember-mk/core");

Mk.Animation = Em.Object.extend({
  options: null, //{duration, stopEventHandling, immediately}}  
  fn: null,
  view: null, 

  init: function(){
    this._super();
  }

});
