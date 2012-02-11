
require("ember-mk/core");
require("ember-mk/mixins/animatable");


Mk.ScrollMixin = Em.Mixin.create(Mk.Animatable, {

  scrollOptions: {
    hScroll: false,
    vScroll: true,
    duration: 750,
    velocity: 0.2,

    exceeded: true,

    simultaneously: true,
    initThreshold: 10
  },

  panOptions: {
    numberOfRequiredTouches: 1,
    preventDefaultOnChange: true
  },

  _height: 0,
  _scrollableHeight: null,

  _width: 0,
  _scrollableWidth: null,

  _positionY: 0,
  _positionX: 0,

  _distanceY: 0,
  _distanceX: 0,

  _startTimestamp: 0,


  init: function() {

    var pan = this.get('panOptions');

    // scrollOptions returns of the instance, not from our mixin
    this.scrollOptions = this.get('scrollOptions');

    // TODO; find a better way. 
    if ( this.scrollOptions.simultaneously === undefined ) {
      this.scrollOptions.simultaneously = true;
    }

    if ( this.scrollOptions.initThreshold === undefined ) {
      this.scrollOptions.initThreshold = 10;
    }

    if ( this.scrollOptions.duration === undefined ) {
      this.scrollOptions.duration = 750;
    }

    if ( this.scrollOptions.velocity === undefined ) {
      this.scrollOptions.velocity = 0.2;
    }

    if ( this.scrollOptions.hScroll === undefined ) {
      this.scrollOptions.hScroll = false;
    }

    if ( this.scrollOptions.vScroll === undefined ) {
      this.scrollOptions.vScroll = true;
    }

    if ( this.scrollOptions.exceeded === undefined ) {
      this.scrollOptions.exceeded = true;
    }



    pan["simultaneously"] = this.scrollOptions.simultaneously;
    pan["initThreshold"] = this.scrollOptions.initThreshold;

    pan["delegateName"] = this.scrollOptions.delegateName;
    pan["delegate"] = this.scrollOptions.delegate;

    if ( this.scrollOptions.hScroll && this.scrollOptions.vScroll  ) {
      pan["direction"] = Em.GestureDirection.Horizontal | Em.GestureDirection.Vertical;
    } else if ( this.scrollOptions.hScroll ) {
      pan["direction"] = Em.GestureDirection.Horizontal;
    } else if ( this.scrollOptions.vScroll ) {
      pan["direction"] = Em.GestureDirection.Vertical;
    }

    this.set('panOptions', pan);
    //console.log( this.get('panOptions').simultaneously );

    this._super();
  },

  didInsertElementEnd: function() {
    
    this._setup_dimensions();
    this._super();

  },


  // call this method if you want to reset the scroll position when the view is already inDOM state
  refresh: function(refreshParentProperties, refreshViewProperties) {

    var self = this; 

    Em.run.next(function() {

      if ( self.get('state') === 'inDOM' ) {

        if ( refreshParentProperties ) {

          var parentView = self.get('parentView');
          if ( Mk.ScrollWrapper.detect(parentView)  ) {
            parentView.setUpDimensions();  
          }

          var parent = self.$().parent();
          self.set('_scrollableHeight', parent.height());
          self.set('_scrollableWidth', parent.width());
        }

        if ( refreshViewProperties ) {
          self.set('_height', self.$().outerHeight(true));
          self.set('_width', self.$().width());
        }

        var positionX = self.get('_positionX');
        var positionY = self.get('_positionY');

        self.get('element').style['WebkitTransition'] = null;

        self._transformOnChange(positionX*(-1), positionY*(-1)  );
        self._restartElasticEffect();

        // todo: must test if the gestures was already recognized
        if ( !self.scrollOptions.simultaneously ) { 
          self.unblockGestureRecognizer();
        }
      }

      //console.log( 'id ' + self.id + ' parent ' + self.$().parent().attr("id") ) ;
      //console.log( ' width' +self.get('_width')  + ' scroll ' + self.get('_scrollableWidth' ) );
      //console.log( ' height' +self.get('_height')  + ' scroll ' + self.get('_scrollableHeight' ) );

    });


  }, 



  /*
 * Dimensions can be setup on view declaration.
 * Setup dimensions on the view is required when view dimensions are updated after inserting the element in the DOM.
 */

  // todo: when content is updated, setup_dimensions refresh
  _setup_dimensions: function() {

    //var height, width;  
    //var parentId = this.$().parent().attr("id");
    var parent = this.$().parent();
    this.id = '#'+this.get('elementId');


    // TODO: all the ancestors cannot have height 100%--> because returns window.height
    // it should be one ( extend to its child ), which returns the correct height ( either parent or parent.parent...)
    // http://forum.jquery.com/topic/how-to-solve-the-100-height-problem    
    
    if ( !this.get('_scrollableHeight' ) ){
      this.set('_scrollableHeight', parent.height());
    }

    if ( !this.get('_scrollableWidth' ) ){
      this.set('_scrollableWidth', parent.width());
    }

    if ( !this.get('_height' ) ){
      this.set('_height', this.$().outerHeight(true));
    }

    if ( !this.get('_width' ) ){
      //set(this, '_width', this.$().outerWidth(true)); // takes parentWidth when 100%
      this.set('_width', this.$().width());
    }

     //console.log( 'id ' + this.id + ' parent ' + this.$().parent().attr("id") ) ;
     //console.log( ' width' +this.get('_width')  + ' scroll ' + this.get('_scrollableWidth' ) );
     //console.log( ' height' +this.get('_height')  + ' scroll ' + this.get('_scrollableHeight' ) );

  },

  // when the user touch the screen the current animation will be stopped
  touchStart: function() {

		var regex = /matrix\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/;
    var transform = window.getComputedStyle( this.get('element') ).webkitTransform;
    var match = regex.exec(transform);

    if(match){

      this.set('_positionX', Math.round( match[1] ) );
      this.set('_positionY', Math.round( match[2] ) );

      var properties = {};
      if ( this.scrollOptions.vScroll ) {
        properties['y'] = this.get('_positionY'); 
      }
      if ( this.scrollOptions.hScroll ) {
        properties['x'] = this.get('_positionX'); 
      }

      // this will stop the current animation
      this.get('element').style['WebkitTransition'] = null;
      // this will setup the coordinates on the position the animation
      // was stopped
      this.$().css(properties);

    }



  },

  panStart: function(recognizer){


    this._restartElasticEffect();
    this._debugRecognizer('panStart', recognizer );
    var translation = recognizer.get('translation');
    this._transformOnChange( translation.x, translation.y );

  },

  panChange: function(recognizer){
   
    this._debugRecognizer( 'panChange' , recognizer );
    var translation = recognizer.get('translation');
    this._transformOnChange( translation.x, translation.y );

  },

  panEnd: function(recognizer){

    this._debugRecognizer( 'panEnd' , recognizer );
    var translation = recognizer.get('translation');

    this._applyElasticEffect(translation.x, translation.y);
    this._correctPosition();

    if ( !this.scrollOptions.simultaneously ) { 
      this.unblockGestureRecognizer();
    }
  },

  panCancel: function(recognizer){

    this._debugRecognizer( 'panCancel' , recognizer );

    if ( !this.scrollOptions.simultaneously ) { 
      this.unblockGestureRecognizer();
    }

  },

  _applyElasticEffect: function(positionX, positionY){

    // it does not move
    //
    this._transformPosition(positionX, positionY);

    //this._debugPosition('ELASTIC (1)');
   
    var time = Date.now() - this.get('_startTimestamp');

    var distanceY = this.get('_distanceY');
    var distanceX = this.get('_distanceX');

    var addToPositionY = this.scrollOptions.velocity*distanceY/time * this.get('_height');
    var addToPositionX = this.scrollOptions.velocity*distanceX/time * this.get('_width');

    //console.log('*** addToPositionY '+addToPositionY );
    this._transformOnChange( addToPositionX,  addToPositionY, this.scrollOptions.duration );

    //this._debugPosition('ELASTIC (3)');

  },

  _transformPosition: function(positionX, positionY) {

    var result;

    result = this.get('_positionY');
    result+= positionY;

    if ( !this.scrollOptions.exceeded ) {

      var newPositionY = this._getCorrectedPosition( true, result );
      if ( newPositionY !== undefined ) {
        result = newPositionY;
      }

    }

    this.set('_positionY', result);


    result = this.get('_positionX');
    result+= positionX;
    if ( !this.scrollOptions.exceeded ) {

      var newPositionX = this._getCorrectedPosition( false, result );
      if ( newPositionX !== undefined ) {
        result = newPositionX;
      }

    }

    this.set('_positionX', result);

    result = this.get('_distanceY');
    result+= positionY;
    this.set('_distanceY', result);

    result = this.get('_distanceX');
    result+= positionX;
    this.set('_distanceX', result);

  },

  _restartElasticEffect: function(){

    this.set('_distanceY', 0);
    this.set('_distanceX', 0);
    this.set('_startTimestamp', Date.now() );

  },

  _transformOnChange: function(positionX, positionY, duration) {
    
    this._transformPosition(positionX, positionY);

    var properties = {};

    if ( !duration ) {
      duration = undefined;
    } else {
      //https://github.com/rstacruz/jquery.transit/issues/22
      properties['queue'] = false; 
    }


    if ( this.scrollOptions.vScroll ) {
      properties['y'] = this.get('_positionY'); 
    }

    if ( this.scrollOptions.hScroll ) {
      properties['x'] = this.get('_positionX'); 
    }

    this.animate({duration: duration}, properties); 
    
  },

  _getCorrectedPosition: function(vertical, currentPosition){

      var result = undefined
        , position
        , max;

      if ( vertical ) { 

        if ( currentPosition === undefined ) {
          currentPosition = this.get('_positionY');
        }

        max = this.get('_height') - this.get('_scrollableHeight');


      } else {

        if ( currentPosition === undefined ) {
          currentPosition = this.get('_positionX');
        }

        max = this.get('_width') - this.get('_scrollableWidth');

      }

      position = currentPosition*(-1);
      if ( max < 0 ||  position < 0) {
        result = 0;
      } else if ( position > max ) {
        result = max*(-1);
      }

      return result;

  },


  _correctPosition: function() {


    if ( this.scrollOptions.vScroll ) {

      var newPositionY = this._getCorrectedPosition( true ); 

      if ( newPositionY !== undefined ) {

        this.animate({duration: this.scrollOptions.duration}, {y: newPositionY}); 

        this.set('_positionY', newPositionY);

      } 
    }

    if ( this.scrollOptions.hScroll ) {

      var newPositionX = this._getCorrectedPosition( false );

      if ( newPositionX !== undefined ) {

        this.animate({duration: this.scrollOptions.duration}, {x: newPositionX}); 

        this.set('_positionX', newPositionX);

      } 
    }

  },

  _debugPosition: function(name) {

    if ( !name ) name = '';
    console.log( name +' position X ' + this.get('_positionX') + ' Y ' + this.get('_positionY') );

  },

  _debugRecognizer: function(name, r) {

    //console.log(name + '  ' + this.toString() );
    //
    /*
    var change = r.get('translation')
    var positionX = this.get('_positionX');
    var positionY = this.get('_positionY');
    //console.log( name+ ' x ('+r.translation.x+') pos ('+positionX+')' );
    console.log( name+ ' y ('+r.translation.y+') pos ('+positionY+')' );
    */

  }

});
