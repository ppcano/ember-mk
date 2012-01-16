
var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;


Mk.ScrollMixin = Em.Mixin.create(Mk.Animatable, {

  scrollOptions: {
    hScroll: false,
    vScroll: true,
    duration: 750,
    velocity: 0.2,

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
    this.scrollOptions = this.get('scrollOptions');

    pan["simultaneously"] = this.scrollOptions.simultaneously;
    pan["initThreshold"] = this.scrollOptions.initThreshold;

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

    result = get(this, '_positionY');
    result+= positionY;
    set(this,'_positionY', result);

    result = get(this, '_positionX');
    result+= positionX;
    set(this,'_positionX', result);

    result = get(this, '_distanceY');
    result+= positionY;
    set(this,'_distanceY', result);

    result = get(this, '_distanceX');
    result+= positionX;
    set(this,'_distanceX', result);

  },

  _restartElasticEffect: function(){

    set(this, '_distanceY', 0);
    set(this, '_distanceX', 0);
    set(this, '_startTimestamp', Date.now() );

  },

  _transformOnChange: function(positionX, positionY, duration) {
    
    this._transformPosition(positionX, positionY);


    if ( !duration ) {
      duration = '0s';
    }

    if ( this.scrollOptions.vScroll ) {

      positionY = get(this, '_positionY');
      this.animate({duration: duration}, function(me) {

        move( me.id )
          .y(positionY)
          .duration(duration)
          .end();

      });


    }

    if ( this.scrollOptions.hScroll ) {

      positionX = get(this, '_positionX');

      this.animate({duration: duration}, function(me) {

        move( me.id )
          .x(positionX)
          .duration(duration)
          .end();

      });

    }

    //console.log( ' distanceY ' + distanceY + ' positionY ' +positionY );
    
  },

  _correctPosition: function() {

    var maxHeight = this.get('_height') - this.get('_scrollableHeight');
    var maxWidth = this.get('_width') - this.get('_scrollableWidth');



    if ( this.scrollOptions.vScroll ) {

      var positionY = get(this, '_positionY')*(-1);
      var newPositionY = undefined;

      if ( maxHeight < 0 ||  positionY < 0) {
        newPositionY = 0;
      } else if ( positionY > maxHeight ) {
        newPositionY = maxHeight*(-1);
      }

      if ( newPositionY !== undefined ) {


        this.animate({duration: this.scrollOptions.duration}, function(me) {

          move( me.id )
            .y(newPositionY)
            .duration(me.scrollOptions.duration)
            .end();

        });

        set(this,'_positionY', newPositionY);

      } 
    }

    if ( this.scrollOptions.hScroll ) {

      var positionX = get(this, '_positionX')*(-1);
      var newPositionX = undefined;

      if ( maxWidth < 0 ||  positionX < 0) {
        newPositionX = 0;
      } else if ( positionX > maxWidth ) {
        newPositionX = maxWidth*(-1);
      }

      if ( newPositionX !== undefined ) {


        this.animate({duration: this.scrollOptions.duration}, function(me) {

          move( me.id )
            .x(newPositionX)
            .duration(me.scrollOptions.duration)
            .end();

        });



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
    console.log( name+ ' x ('+r.translation.x+') pos ('+positionX+')' );
    console.log( name+ ' y ('+r.translation.y+') pos ('+positionY+')' );
    */
  }

});
