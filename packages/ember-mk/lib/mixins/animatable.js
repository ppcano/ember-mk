
require("ember-mk/core");
require("ember-mk/animation/animation_manager");

// Apply Mixin to your views.
//
// options: hash with following properties {duration, delay, stopEventHandling, immediately}
//
// animation can be: 
// - function
// - hash with properties: x, y
//
//
// Example: 
//
//    this.animate({duration: duration}, function(me) {
//
//      move( me.id )
//        .y(positionY)
//        .duration(duration)
//        .end();
//
//    });
Mk.Animatable = Em.Mixin.create({

  animate: function(options, animation, callback) {

    // TODO: That should be updated with an own API
    // wrapping the api to movejs
    if ('function' != typeof animation) {

      var fn
        , duration = options.duration || 0
        , x = animation['x']
        , y = animation['y'];

      if ( x !== undefined && y !== undefined ) {

        fn = function( me ) {

          move('#'+ me.get('elementId') )
            .x(x)
            .y(y)
            .duration(duration)
            .end();

        }

      } else if ( x !== undefined ) {

        fn = function( me ) {

          move('#'+ me.get('elementId') )
            .x(x)
            .duration(duration)
            .end();

        }

      } else if ( y !== undefined ) {

        fn = function( me ) {

          move('#'+ me.get('elementId') )
            .y(y)
            .duration(duration)
            .end();

        }

      } else {

        throw Error( 'animation is not valid');

      }

      animation = fn;

    }

    var animation = Mk.Animation.create({
      options: options,
      fn: animation,
      callback: callback,
      view: this
    });
    Mk.AnimationManager.push( animation );
  }

});
