require("ember-mk/core");
require("ember-mk/animation/animation_manager");


// Apply Mixin to your views.
//
// options: hash with following properties {duration, delay, stopEventHandling, immediately}
//
// animation property can be setup via: 
// 1) functions
//    you must call willAnimate/didAnimate
//
//      this.animate({duration: duration}, function(me) {
//
//        move( me.id )
//          .y(positionY)
//          .duration(duration)
//          .end();
//
//      });
//
// 2) css properties (see jquery.transit API)
//

Mk.Animatable = Em.Mixin.create({
  

  willAnimate: function(stopEventHandling) {

    if ( stopEventHandling ) Ember.EventDispatcherEnabled = false;

  },

  didAnimate: function(stopEventHandling) {

    if ( stopEventHandling ) Ember.EventDispatcherEnabled = true;

  },

  animate: function(options, animation, easing, callback) {

    var fnCallback
      , fn
      , self = this
      , stopEventHandling = options.stopEventHandling 
      , duration = options.duration;


    if ( typeof easing == 'function') {
      callback = easing;
      easing = undefined;
    } else if ( !easing ) {
      easing = undefined;
    }

    // wrapping the api to jquery.transit
    if ( typeof animation != 'function') {

      var ease = easing
        , properties = animation;


      if ( duration ) {


        fnCallback = function() {

          self.didAnimate( stopEventHandling );
          if ( callback ) callback();

        };


        fn = function( me ) {

          self.willAnimate( stopEventHandling );
          me.$().transition(properties, duration, easing, fnCallback);

        }

      } else {

        fn = function( me ) {
          me.$().css(properties);
        }

      }

      animation = fn;

    }

    var item = Mk.Animation.create({
      options: options,
      fn: animation,
      view: this
    });
    Mk.AnimationManager.push( item );
  }

});
