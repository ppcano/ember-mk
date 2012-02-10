require("ember-mk/core");

//  improve lifecycle --> depending on Application?
Mk.AnimationManager = Em.Object.create({

  content: Ember.A(),
  animation: null,

  init: function(){
    this._super();
  },

  push: function(animation) {

     if ( animation.options.immediately ) {
       this.run(animation);
     } else {
       this.get('content').pushObject( animation );
       this.startNewAnimation(); 
     }

  },

  endCurrentAnimation: function() {
    this.set('animation', null);
  },

  startNewAnimation: function() {

    if (!this.get('animation') ) {

      var animation = this.get('content').shiftObject();

      if ( animation ) {
        this.set('animation', animation);
        this.run( animation );
      }

    } 

  },

  startEventHandling: function() {
    Ember.EventDispatcherEnabled = true;
  },

  stopEventHandling: function() {
    Ember.EventDispatcherEnabled = false;
  },

  run: function(animation) {

    if ( !animation.options.delay ) {
      animation.options.delay = 0;
    }

    if ( !animation.options.duration ) {
      animation.options.duration = 0;
    }

    var self = this;

    Ember.run.later(function(){

      if ( animation.options.stopEventHandling ) {
        self.stopEventHandling();
      }

      animation.fn( animation.view );

      Ember.run.later(function(){

        if ( animation.options.stopEventHandling ) 
          self.startEventHandling();

        // OJO: testing think about, back animations can be immediately
        if ('function' == typeof animation.callback)
          animation.callback(animation.view);

      }, animation.options.duration);

      // otherwise, other animations cannot began
      if ( !animation.options.immediately ) {

        self.endCurrentAnimation();
        self.startNewAnimation();

      }

    }, animation.options.delay);

  }

});

