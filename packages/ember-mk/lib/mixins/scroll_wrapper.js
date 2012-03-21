
require("ember-mk/core");

var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;


Mk.ScrollWrapper = Ember.Mixin.create({

  heights: [],
  enableLogging: false,

  didInsertElement: function() {
    this._super();
    this.setUpDimensions();
  },

  setUpDimensions: function() {

    var elementHeight 
      , elementHeights = 0
      , self = this;

    this.heights.forEach( function(item) {
           
      //elementsHeight+= $('#'+item).height();
      
      elementHeight = (typeof item === 'number')?item:$('#'+item).height();

      ember_assert('scroll wrapper mixin (' + item + ') not found ', !!elementHeight);

      elementHeights+=elementHeight;

      if ( self.enableLogging ) {
        console.log('item ' + item + ' elementHeight ' + elementHeight + ' total ' + elementHeights  );
      }
      
    });

    // innerHeight: works in safari browser and phonegap ios app
    // TODO: move to window.mkHeight prototype
    var height = window.innerHeight-elementHeights;

    this.$().height(height); 

  }
});
