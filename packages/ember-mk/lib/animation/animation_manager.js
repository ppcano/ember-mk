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

  run: function(animation) {

    var self = this;

    Ember.run.next(function(){

      animation.fn( animation.view );

      // otherwise, other animations cannot began
      if ( !animation.options.immediately ) {
        self.endCurrentAnimation();
        self.startNewAnimation();
      }

    });

  }

});
