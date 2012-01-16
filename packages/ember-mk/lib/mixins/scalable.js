
// This mixin is a first attempt to create UIs which scales on multiple screens, based on
// screen dimensions
Mk.ScalableMixin = Em.Mixin.create({
  // properties
  height: null,
  margin_top: null,

  vProperties: {
      "height": "height", 
      "top": "top", 
      "margin_top": "margin-top"
  },

  didInsertElement: function() {
    
    //var wHeight = window.innerHeight;
    var wHeight = window.outerHeight;

    var view
      , css
      , value
      , values = {}
      , heights = this.vProperties;

    for ( view in heights ) {
      css = heights[view];
      value = this.get(view);

      if ( value ) {
        values[css] = wHeight*value+'px';
      }

    }

    // TODO: not total support: http://kangax.github.com/es5-compat-table/
    if ( Object.keys(values).length ) {
      this.$().css(values);
    }

/*
    for ( css in values ) {
      console.log( 'value ' + values[css] + ' css ' + css + ' height ' + wHeight);
    }
*/
    this._super();

  }


});

