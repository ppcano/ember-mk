
(function(exports) {
window.Mk = Ember.Namespace.create();

})({});

(function(exports) {

var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;


// TODO: move to ember-touch????
Ember.EventDispatcherEnabled = true; 

Ember.EventDispatcher.reopen({

  setupHandler: function(rootElement, event, eventName) {
    var self = this;

    rootElement.delegate('.ember-view', event + '.ember', function(evt, triggeringManager) {

      if ( Ember.EventDispatcherEnabled ) {

        var view = Ember.View.views[this.id],
            result = true, manager = null;

        manager = self._findNearestEventManager(view,eventName);

        if (manager && manager !== triggeringManager) {
          result = self._dispatchEvent(manager, evt, eventName, view);
        } else if (view) {
          result = self._bubbleEvent(view,evt,eventName);
        } else {
          evt.stopPropagation();
        }

        return result;

      }
    });
  },


});


})({});

(function(exports) {

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


})({});

(function(exports) {
/*

require('ember-mk/core');

require('ember-mk/system/animation');
require('ember-mk/system/animation_style');
require('ember-mk/system/animation_manager');

require('ember-mk/initializers/event_dispatcher');
require('ember-mk/initializers/view');


require('ember-mk/mixins/animatable');
require('ember-mk/mixins/scalable');
require('ember-mk/mixins/scroll');


require('ember-mk/views/modal');
require('ember-mk/views/swipe');
require('ember-mk/views/tab');
*/

})({});

(function(exports) {

var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;

Mk.Animatable = Em.Mixin.create({

  animate: function(options, fn, callback) {

    var animation = Mk.Animation.create({
      options: options,
      fn: fn,
      callback: callback
    });
    Mk.AnimationManager.push( animation );
  }

});

})({});

(function(exports) {

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


})({});

(function(exports) {

var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;


Mk.ScrollMixin = Em.Mixin.create({

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
      move(this.id)
        .y(positionY)
        .duration(duration)
        .end(function(){
        });

    }

    if ( this.scrollOptions.hScroll ) {

      positionX = get(this, '_positionX');
      move(this.id)
        .x(positionX)
        .duration(duration)
        .end(function(){
        });

    }

    //console.log( ' distanceY ' + distanceY + ' positionY ' +positionY );
    
  },

  _correctPosition: function() {

    var maxHeight = this.get('_height') - this.get('_scrollableHeight');
    var maxWidth = this.get('_width') - this.get('_scrollableWidth');

    var positionY = get(this, '_positionY')*(-1);
    var positionX = get(this, '_positionX')*(-1);

    var newPositionY = undefined;
    var newPositionX = undefined;

    if ( this.scrollOptions.vScroll ) {

      if ( maxHeight < 0 ||  positionY < 0) {
        newPositionY = 0;
      } else if ( positionY > maxHeight ) {
        newPositionY = maxHeight*(-1);
      }

      if ( newPositionY !== undefined ) {

        var that = this;
        move(this.id)
          .y(newPositionY)
          .duration(this.scrollOptions.duration)
          .end(function(){


        });

        set(this,'_positionY', newPositionY);

      } 
    }

    if ( this.scrollOptions.hScroll ) {


      if ( maxWidth < 0 ||  positionX < 0) {
        newPositionX = 0;
      } else if ( positionX > maxWidth ) {
        newPositionX = maxWidth*(-1);
      }

      if ( newPositionX !== undefined ) {

        var that = this;
        move(this.id)
          .x(newPositionX)
          .duration(this.scrollOptions.duration)
          .end(function(){

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

})({});

(function(exports) {

Mk.Animation = Em.Object.extend({
  options: null, //{duration, delay, stopEventHandling, immediately}}  
  fn: null,
  callback: null, 

  init: function(){
    this._super();
  }

});

})({});

(function(exports) {
var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;

Mk.AnimationManager = Em.Object.create({

  content: Ember.A(),
  animation: null,

  init: function(){
    this._super();
  },

  push: function(animation) {

     if ( animation.options.immediately ) {
       this.run(animation);
     } else {
       this.get('content').pushObject( animation );
       this.startNewAnimation(); 
     }

  },

  endCurrentAnimation: function() {
    this.set('animation', null);
  },

  startNewAnimation: function() {

    if (!this.get('animation') ) {

      var animation = this.get('content').popObject();

      if ( animation ) {
        this.set('animation', animation);
        this.run( animation );
      }

    } 

  },

  startEventHandling: function() {
    Ember.EventDispatcherEnabled = true;
  },

  stopEventHandling: function() {
    Ember.EventDispatcherEnabled = false;

  },

  run: function(animation) {

    if ( !animation.options.delay ) {
      animation.options.delay = 0;
    }

    var that = this;

    setTimeout(function(){

      if ( animation.options.stopEventHandling ) {
        that.stopEventHandling();
      }

      animation.fn();

      setTimeout(function(){

        if ( animation.options.stopEventHandling ) 
          that.startEventHandling();

        // OJO: testing think about, back animations can be immediately
        if ('function' == typeof animation.callback)
          animation.callback();

        if ( !animation.options.immediately ) {

          that.endCurrentAnimation();
          that.startNewAnimation();

        }

      }, animation.options.duration);

    }, animation.delay);

  }

});


})({});

(function(exports) {
Mk.AnimationStyle = {
  FROM_DOWN: 0
  , FROM_UP: 1
  , FROM_LEFT: 2
  , FROM_RIGHT: 3
  , NONE: 4
};

})({});

(function(exports) {
var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;


Mk.ModalView = Ember.Mixin.create({

  position: null,
  move: null,
  defaultHidden: true,
  duration: '1s',
  animationStyle: Mk.AnimationStyle.FROM_RIGHT,


  didInsertElement: function() {

    this._super();

    if ( this.defaultHidden ) {

      set(this, 'isVisible', false);

      if ( this.animationStyle !== Mk.AnimationStyle.NONE ) {

        var id = get( this, 'elementId');
        var position;

        if ( this._isHorizontalAnimation() ) {

          this.move = $(window).width();
          position = this.move;


          if ( this.animationStyle  === Mk.AnimationStyle.FROM_LEFT ) {
            position = position*(-1);
          }

          var that = this;


          move('#'+id)
            .x(position)
            .end(function(){

              set(that, 'isVisible', true);
              set(that, 'position', position);

             });


        } else {

          this.move = $(window).height();
          position = this.move;

          if ( this.animationStyle  === Mk.AnimationStyle.FROM_UP ) {
            position = position*(-1);
          }

          var that = this;

          move('#'+id)
            .y(position)
            .end(function(){

              set(that, 'isVisible', true);
              set(that, 'position', position);

             });

        }

      }

    }

  },

  toogle: function() {

    if ( this.animationStyle !== Mk.AnimationStyle.NONE ) {

      var id = get(this, 'elementId');
      var position = get(this, 'position');

      position = ( position !== 0 ) ? 0 : this.move; 

      if ( this.animationStyle === Mk.AnimationStyle.FROM_UP || this.animationStyle === Mk.AnimationStyle.FROM_LEFT ) {
        position = position*(-1);
      }


      if ( this._isHorizontalAnimation() ) {

        move('#'+id)
          .x(position)
          .duration(this.duration)
          .end();

      } else {

        move('#'+id)
          .y(position)
          .duration(this.duration)
          .end();

      }

      set(this, 'position', position);

    } else {

      var isVisible = get(this, 'isVisible'); 
      set(this, 'isVisible', !isVisible);

    }

  },

  _isHorizontalAnimation: function(){

    return ( this.animationStyle === Mk.AnimationStyle.FROM_LEFT 
            || this.animationStyle === Mk.AnimationStyle.FROM_RIGHT); 

  }

});


Mk.ModalViewButton = Em.View.extend({

  view: null,

  didInsertElement: function() {

		this._super();

		// here because on init, thew view could have not been created
    var view = this.get('view');
    if (Em.typeOf(view) === "string") {
      view = Em.getPath(view);
			this.set('view', view);
    }

  },

  touchHoldEnd: function(recognizer) {
    this.get('view').toogle();
  },

	click: function(){
    this.get('view').toogle();
  }


});



})({});

(function(exports) {
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


})({});

(function(exports) {
var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;

/*
 * Using left property because:
 *  - isVisible: won't work on scrolling context.
 *  - visibility: hidden, does not render correctly panes on change. 
 */
Mk.TabMainView = Ember.View.extend({

  controller: null,
  panes: {},


  willInsertElement: function() {

    this._super(); 
    var panes = get( this, 'panes');

    var viewName, childViews, len, view, idx;

    childViews = get(this, '_childViews');
    len = get(childViews, 'length');

    for(idx = 0; idx < len; idx++) {
      view = childViews[idx];
      viewName = get(view, 'viewName');   
      if ( view instanceof Mk.TabPaneView ) {
        panes[viewName] = view;     
      }
    }

    idx = 0;
    for( viewName in panes ) {
      panes[viewName].$().css("left", "100%"); 
      idx++;
    }

  },

  didInsertElement: function() {

    this._super(); 
    this.observesCurrentView();
  },

  observesBeforeCurrentView: function() {

    this.show(false);

  }.observesBefore('currentView'),

  observesCurrentView: function() {

    this.show(true);

  }.observes('currentView'), 

  show: function(visible, pane) {

    if ( pane === undefined ) {
      var currentView = get(this, 'currentView');
      var panes = get( this, 'panes');
      pane = panes[currentView];
    }
    
    var left = (visible)? "0%" : "100%";
    pane.$().css("left", left); 

  }

});

Mk.TabPaneView = Ember.View.extend({
  classNames: ['tab_pane']

});


Mk.TabView = Ember.View.extend({

  tabsContainer: SC.computed(function() {
    return this.nearestInstanceOf(Mk.TabMainView);
  }).property(),

  touchHoldEnd: function(recognizer) {
    setPath(this, 'tabsContainer.currentView', get(this, 'value'));
  },

	click: function(){
    setPath(this, 'tabsContainer.currentView', get(this, 'value'));
  }

});


})({});
