require("ember-mk/core");
require("ember-mk/animation/animation_manager");


// Apply Mixin to your views.
//
// options: hash with following properties {duration, delay, stopEventHandling, immediately}
//
// animation property can be setup via: 
// 1) functions
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
//
Mk.Animatable = Em.Mixin.create({

  animate: function(options, animation, easing, callback) {

    if ( typeof easing == 'function') {
      callback = easing;
      easing = null;
    } else if ( !easing ) {
      easing = null;
    }

    // wrapping the api to jquery.transit
    if ( typeof animation != 'function') {

      var fn
        , ease = easing
        , duration = options.duration 
        , properties = animation;


      if ( duration ) {

        fn = function( me ) {
          me.$().transition(properties, duration, easing);
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
      callback: callback,
      view: this
    });
    Mk.AnimationManager.push( item );
  }

});
