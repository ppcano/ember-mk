var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;

/* Based on SwipeView approach of Matteo Spinelli
 */
Mk.SwipeView = Ember.ContainerView.extend(Mk.Animatable,{
  
  itemViewClass: Em.View,

  /**
    Defines the item based that will be shown at startup based on index content. 

    @type Integer
    @default 0
  */
  contentIndex: 0,

  content: null,

  duration: 500,
  content: null,

	swipeOptions: {
		direction: Em.OneGestureDirection.Left | Em.OneGestureDirection.Right,
		cancelPeriod: 100,
    simultaneously: false,
		swipeThreshold: 20,
		initThreshold: 10
	},
  //--- private properties
  
  isMoving: false,
  classNames: ['swipe_slider'],
  width: null,
  translatePosition: null,

	activeIndex: null,
	activeLeftCss: null,

  init: function(){

    this._super();

    var view, index;


    var itemViewClass = get(this, 'itemViewClass');
    if (Em.typeOf(itemViewClass) === "string") {
      itemViewClass = Em.getPath(itemViewClass);
      set(this, 'itemViewClass', itemViewClass);
    }

    //TODO: handlebars contentBinding is not working....
    var content  = get(this, 'content');
    if (Em.typeOf(content) === "string") {
      content = Em.getPath(content);
      set(this, 'content', content);
    }


    var contentIndex = get(this, 'contentIndex'); 
    
    index = this._getContentIndex(false); 

    view = this.createChildView(itemViewClass, {
      classNames: ['swipe_item'],
      content: content[index]
    });


    this._appendView(view);

    index = contentIndex;

    view = this.createChildView(itemViewClass, {
      classNames: ['swipe_item'],
      content: content[index]
    });
    this._appendView(view);


    index = this._getContentIndex(true); 

    view = this.createChildView(itemViewClass, {
      classNames: ['swipe_item'],
      content: content[index]
    });
    this._appendView(view);


  },

  didInsertElement: function() {

    var child = this.get('childViews');

    set(this, 'activeLeftCss', 0);
    set(this, 'activeIndex', 1);

    child[0].$().css("left", "-100%"); 
    child[1].$().css("left", "0%"); 
    child[2].$().css("left", "100%"); 

    var width = this.$().width();   
    set(this, 'width', width);
    set(this, 'translatePosition', 0);

  },

	moveBack: function(fn){

    if ( !this.get('isMoving') ) {

      this.set('isMoving', true );
      this.set('activeIndex', this._getIndex(false) );
      this.set('contentIndex', this._getContentIndex(false) );

      var activeLeftCss= this.get('activeLeftCss');
      activeLeftCss +=-1;
      this.set('activeLeftCss', activeLeftCss);

      var that = this;
      // if after callback, user can click several times
      this.move(false, function() { 

        that.set('isMoving', false );
        if ( fn ) fn();

      });
    }

	},

	moveNext: function(fn){

    if ( !this.get('isMoving') ) {

      this.set('isMoving', true );
      this.set('activeIndex', this._getIndex(true) );
      this.set('contentIndex', this._getContentIndex(true) );

      var activeLeftCss= this.get('activeLeftCss');
      activeLeftCss +=1;
      this.set('activeLeftCss', activeLeftCss);

      var that = this;
      this.move(true, function() { 
      
        that.set('isMoving', false );
        if ( fn ) fn();

      });
    }
	},

	swipeStart: function(recognizer) {
    //console.log('swipe start.....');
	},

	swipeChange: function(recognizer) {
     
    //console.log('swipe change.....');

	},

	swipeCancel: function(recognizer) {

    //console.log('swipe cancel.....'); 
    this.unblockGestureRecognizer();

	},

	swipeEnd: function(recognizer) {
     
    //console.log('swipe end.....'); 

    var that = this;
    if ( recognizer.swipeDirection === Em.OneGestureDirection.Left ) {
        this.moveNext( function() {
          that.unblockGestureRecognizer();
        });

    } else if ( recognizer.swipeDirection === Em.OneGestureDirection.Right ) {

        this.moveBack( function() {
          that.unblockGestureRecognizer();
        });

    }

	},

  move: function(next, fn) {

		var id = this.get('elementId');
		var width = this.get('width');

    var translatePosition = this.get('translatePosition');
		translatePosition += (next) ? width*(-1): width;


    var that = this;
    this.animate({duration: that.duration, stopEventHandling:true}, function() {

      move('#'+id)
        .x(translatePosition)
        .duration(that.duration)
        .end();

    }, function() {

        var activeLeftCss = that.get('activeLeftCss');
        var left, leftIndex, rightIndex, leftContentIndex, rightContentIndex;

        var child = that.get('childViews');
        var content = that.get('content');

        leftIndex = that._getIndex(false);
        rightIndex = that._getIndex(true);

        left = (activeLeftCss-1)*100+'%';
        child[leftIndex].$().css("left", left); 

        left = (activeLeftCss+1)*100+'%';
        child[rightIndex].$().css("left", left); 

        leftContentIndex = that._getContentIndex(false);
        rightContentIndex = that._getContentIndex(true);

        set( child[leftIndex], 'content', content[leftContentIndex] );
        set( child[rightIndex], 'content', content[rightContentIndex] );

        set(that, 'translatePosition', translatePosition);
        if ( fn ) {
          fn();
        }


    });

  },

  _getIndex: function( next ) {

		var result = this.get('activeIndex');
    result +=(next) ? 1:-1; 

    if ( result < 0 ) { 
      result = 2;
    } else if ( result > 2 ) { 
      result = 0;
    }

    return result;
  },

  _getContentIndex: function( next ) {

    var length = this.get('content').get('length');
		var result = this.get('contentIndex');
    result +=(next) ? 1:-1; 

    if ( result < 0 ) { 
      result = length-1;
    } else if ( result > length-1 ) { 
      result = 0;
    }

    return result;
  },

	_appendView: function(newView) {

    var child = this.get('childViews');
    set(newView, '_parentView', this);
    child.pushObject(newView);

	}


});

