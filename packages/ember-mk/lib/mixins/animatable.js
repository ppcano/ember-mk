
var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;

Mk.Animatable = Em.Mixin.create({

  animate: function(options, fn, callback) {

    var animation = Mk.Animation.create({
      options: options,
      fn: fn,
      callback: callback
    });
    Em.AnimationManager.push( animation );
  }

});
