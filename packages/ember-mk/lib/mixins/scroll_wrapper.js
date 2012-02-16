
require("ember-mk/core");

var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;


Mk.ScrollWrapper = Ember.Mixin.create({

  heights: [],

  didInsertElement: function() {
    this._super();
    this.setUpDimensions();
  },

  setUpDimensions: function() {

    var elementHeight 
      , elementHeights = 0;

    this.heights.forEach( function(item) {
           
      //elementsHeight+= $('#'+item).height();
      
      elementHeight = (typeof item === 'number')?item:$('#'+item).height();

      ember_assert('scroll wrapper mixin (' + item + ') not found ', !!elementHeight);

      elementHeights+=elementHeight;
      //console.log('item ' + item + ' elementHeight ' + elementHeight + ' total ' + elementHeights  );
      
    });

    // innerHeight: works in safari browser and phonegap ios app
    // TODO: move to window.mkHeight prototype
    var wHeight = window.innerHeight;
    var height = wHeight-elementHeights;

    /*
    console.log( '--------------' );
    console.log( wHeight );
    console.log( elementHeights );
    console.log( height );
    */
    // scrolling
    this.$().height(height); 

  }
});
