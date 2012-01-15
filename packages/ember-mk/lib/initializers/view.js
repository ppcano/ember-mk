
Em.View.reopen({

  didInsertElementEnd: Ember.K,


  invokeRecursively: function(fn, end) {
    fn.call(this, this);

    this.forEachChildView(function(view) {
      view.invokeRecursively(fn, end);
    });

    if ( end ){ 
      end.call(this, this);
    }

  },

  _notifyDidInsertElement: function() {

    this.invokeRecursively(function(view) {
      view.didInsertElement();
    }, function(view) {
      view.didInsertElementEnd();
    });

  }

});

