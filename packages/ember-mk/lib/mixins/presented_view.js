
require("ember-mk/core");

var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;


Mk.PresentedView = Ember.Mixin.create({

  classNames: ['presented_view'],

  didInsertElement: function(){
    this._super();

    var view = this.get('presentingView');
    if ( view ) {
      view.didPresentElement(this);
    } 

  }

});
