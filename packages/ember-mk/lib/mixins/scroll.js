
require("ember-mk/core");
require("ember-mk/mixins/animatable");

var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;



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


  refresh: function(refreshParentProperties, refreshViewProperties) {

    if ( refreshParentProperties ) {
      var parent = this.$().parent();
      set(this, '_scrollableHeight', parent.height());
      set(this, '_scrollableWidth', parent.width());
    }

    if ( refreshViewProperties ) {
      set(this, '_height', this.$().outerHeight(true));
      set(this, '_width', this.$().width());
    }

    var positionX = this.get('_positionX');
    var positionY = this.get('_positionY');


    this.get('element').style['WebkitTransition'] = null;

    this._transformOnChange(positionX*(-1), positionY*(-1)  );
    this._restartElasticEffect();

    // todo: must test if the gestures was already recognized
    if ( !this.scrollOptions.simultaneously ) { 
      this.unblockGestureRecognizer();
    }


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
    this.id = '#'+get(this, 'elementId');


    // TODO: all the ancestors cannot have height 100%--> because returns window.height
    // it should be one ( extend to its child ), which returns the correct height ( either parent or parent.parent...)
    // http://forum.jquery.com/topic/how-to-solve-the-100-height-problem    
    
    if ( !this.get('_scrollableHeight' ) ){
      set(this, '_scrollableHeight', parent.height());
    }

    if ( !this.get('_scrollableWidth' ) ){
      set(this, '_scrollableWidth', parent.width());
    }

    if ( !this.get('_height' ) ){
      set(this, '_height', this.$().outerHeight(true));
    }

    if ( !this.get('_width' ) ){
      //set(this, '_width', this.$().outerWidth(true)); // takes parentWidth when 100%
      set(this, '_width', this.$().width());
    }

     //console.log( 'id ' + this.id + ' parent ' + this.$().parent().attr("id") ) ;
     //console.log( ' width' +this.get('_width')  + ' scroll ' + this.get('_scrollableWidth' ) );
     //console.log( ' height' +this.get('_height')  + ' scroll ' + this.get('_scrollableHeight' ) );

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
    this._transformPosition(positionX, positionY);
   
    var time = Date.now() - get(this, '_startTimestamp');

    var distanceY = get(this, '_distanceY');
    var distanceX = get(this, '_distanceX');

    var newPositionY = this.scrollOptions.velocity*distanceY/time * this.get('_height');
    var newPositionX = this.scrollOptions.velocity*distanceX/time * this.get('_width');

    this._transformOnChange( newPositionX,  newPositionY, this.scrollOptions.duration );

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

    set(this, '_distanceY', 0);
    set(this, '_distanceX', 0);
    set(this, '_startTimestamp', Date.now() );

  },

  _transformOnChange: function(positionX, positionY, duration, properties) {
    
    this._transformPosition(positionX, positionY);


    if ( !duration ) {
      duration = undefined;
    }

    if ( !properties ) {
      properties = {};
    }

    if ( this.scrollOptions.vScroll ) {
      properties['y'] = this.get('_positionY'); 
    }

    if ( this.scrollOptions.hScroll ) {
      properties['x'] = this.get('_positionX'); 
    }

    this.animate({duration: duration}, properties); 

    //console.log( ' distanceY ' + distanceY + ' positionY ' +positionY );
    
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

        set(this,'_positionY', newPositionY);

      } 
    }

    if ( this.scrollOptions.hScroll ) {

      var newPositionX = this._getCorrectedPosition( false );

      if ( newPositionX !== undefined ) {

        this.animate({duration: this.scrollOptions.duration}, {x: newPositionX}); 

        set(this,'_positionX', newPositionX);

      } 
    }

  },

  _debugRecognizer: function(name, r) {

    //console.log(name + '  ' + this.toString() );
    /*

    var change = get(r, 'translation')
    var positionX = get(this, '_positionX');
    var positionY = get(this, '_positionY');
    //console.log( name+ ' x ('+r.translation.x+') pos ('+positionX+')' );
    console.log( name+ ' y ('+r.translation.y+') pos ('+positionY+')' );
     */
  }

});
