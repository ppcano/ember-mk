
require("ember-mk/core");
require("ember-mk/mixins/animatable");
require("ember-mk/animation/animation_style");

var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;

/*
 * PresenterView gives the ability to present animated views, depending on Mk.AnimationStyle enum.  
 *
 * When you present a presenter view, the system creates a relationship between the presenter view 
 * that did the presenting and the presenter view that was presented, via presentedView and presentingView properties.
 *
 * The ability to present a presenter views provide interesting ways to manage the flow of your application, 
 * creating on this way a chain of presenter views.
 *
 * You can either present normal Views or  Presenter Views.
 *
 */
Mk.PresenterView = Em.ContainerView.extend(Mk.Animatable, {

  classNames: ['presenter'],
  /*
  * Set up the init view which will be inserted in DOM.
  */
  initViewClass: Em.View,

  /*
  * Points to the view which is currently presented ( either PresenterView or normal View ).
  */
  presentedView: null,

  /*
  * Point to the PresenterView which presented this instance.
  * This property will only be configured on PresenterView instances.
  */
  presentingView: null,

  isBeingPresented: false,
  isBeingDismissed: false,

  isPresenting: false,
  isDismissing: false,

  /*
  * When true, present and dismiss action won't be executed.
  */
  isAnimating: function() {

    return this.get('isPresenting') || this.get('isDismissing');
    
  }.property('isPresenting', 'isDismissing').cacheable(), 

  /*
  * Access the instance of the initViewClass.
  */
  initView: function() {

    return this.get('child').get('childViews')[0];
    
  }.property().cacheable(), 


  childViews: ['child'],

  child: Em.ContainerView.extend({

    classNames: ['presenter_child'],

    init: function() {

      this._super();

      var parentView = this.get('parentView');
      var initViewClass = parentView.get('initViewClass');

      var view  = this.createChildView(initViewClass);

      view.set('_parentView', this); 
      view.set('_parentView', this); 
      this.get('childViews').pushObject(view);

    },

    destroyView: function(view) {

      this.get('childViews').removeObject(view);
      view.remove();
      view.destroy();

    }

  }),

  dismiss: function(animation, fn) {

    if ( !this.get('isAnimating') ) {

      this.set('isDismissing', true);
      var childView = this.get('child');

      var backView = this.get('initView');
      var view = this.get('presentedView');;
      view.set('isBeingDismissed', true);
      var animation = animation;
      var that = this;

      var onCompletedFn = function() {

           childView.destroyView( view );

           if (fn && 'function' != typeof fn) {
             fn();
           }

           that.set('presentedView', null);
           that.set('isDismissing', false);

      };

      if ( Mk.AnimationStyle.isFlip(animation.animationStyle) ) {

        this._flip( view, backView,  animation, true, onCompletedFn);

      } else if ( animation.animationStyle === Mk.AnimationStyle.NONE) {

        onCompletedFn();

      } else {

        this._move( view, animation, true, onCompletedFn);

      }

    }

  },

  present: function(view, animation, fn){

    if ( !this.get('isAnimating') ) {

      this.set('isPresenting', true);

      this.set('_onPresentedCallback', fn);
      this.set('_onPresentedAnimation', animation);

      view.set('isBeingPresented', true);

      view.set('_parentView', this );

      if( view instanceof Mk.PresenterView )  {

        view.set('presentingView', this );

      }

      var child =  this.get('child').get('childViews');

      child.pushObject(view);

    }


  },

  didInsertElement: function(){
    this._super();

    var view = this.get('presentingView');
    if ( view ) {
      view.didPresentElement(this);
    } 

  },

  didPresentElement: function(view) {


    var that = this;

    var fn = this.get('_onPresentedCallback');
    var onCompletedFn = function() {


       if (fn && 'function' != typeof fn) {
        fn();
       }

       that.set('presentedView', view);
       view.set('isBeingPresented', false);
       that.set('isPresenting', false);

    };

    var animation = this.get('_onPresentedAnimation');


    if ( Mk.AnimationStyle.isFlip(animation.animationStyle) ) {

      this._flip( this.get('initView'), view, animation, false, onCompletedFn );

    } else if ( animation.animationStyle === Mk.AnimationStyle.NONE) {

      onCompletedFn();

    } else {

      this._move( view, animation, false, onCompletedFn);

    }

  },


  _move: function(view, animation, isBack, fn) {

      var duration = animation.duration;
      var easing = animation.easing;

      if (!isBack) { view.set('isVisible', false); }
    
      var position;
      var val, val2;

      if ( animation.animationStyle ===  Mk.AnimationStyle.FROM_LEFT ||  
           animation.animationStyle ===  Mk.AnimationStyle.FROM_RIGHT ) {

        position = ( animation.animationStyle ===  Mk.AnimationStyle.FROM_LEFT ) 
          ? $(window).width()*(-1) 
          : $(window).width();

        val = {x: position};
        val2 = {x: 0};

      } else {

        position = ( animation.animationStyle ===  Mk.AnimationStyle.FROM_UP ) 
          ? $(window).height()*(-1) 
          : $(window).height();

        val = {y: position};
        val2 = {y: 0};

      }


      if (!isBack) {  

        this.animate({}, function(me) {   

          view.$().css(val);
        
        }, function(me) {

          view.set('isVisible', true);
          
          me.animate({duration:duration}, function(me) {

            view.$().transition(val2, duration, easing);            

          }, function() {

            fn();

          });

        }); 

      } else {

        this.animate({duration:duration}, function(me) {
            view.$().transition(val, duration, easing);
        }, function(me) {
            fn();
        });

      }


  },

  _flip: function(fromView, toView, animation, isBack, fn) {

    var duration = animation.duration;
    var easing = animation.easing;

    var rotate = ( animation.animationStyle === Mk.AnimationStyle.FLIP_FROM_LEFT ||
                     animation.animationStyle === Mk.AnimationStyle.FLIP_FROM_DOWN
                   ) ? -180 : 180;

    if ( isBack ) {
      rotate = rotate*(-1);
    }

    var isHorizontal = ( animation.animationStyle === Mk.AnimationStyle.FLIP_FROM_LEFT ||
                     animation.animationStyle === Mk.AnimationStyle.FLIP_FROM_RIGHT); 

    fromView.$().css('-webkit-backface-visibility', 'hidden');
    toView.$().css('-webkit-backface-visibility', 'hidden');
    
    var transition = (isHorizontal) ?   {rotateY: rotate} :  {rotateX: rotate}  ;
    toView.$().css(transition);


    var perspectiveView = this;
    var transformView = this.get('child');

    perspectiveView.$().css('-webkit-perspective', 1000);
    transformView.$().css('-webkit-transform-style', 'preserve-3d');

    this.animate({duration: duration}, function(me) {

      var transition = ( isHorizontal ) ?  {rotateY: rotate, queue: false}:{rotateX: rotate, queue: false};
      transformView.$().transition(transition, duration, easing);

    }, function(me) {

      perspectiveView.$().css('-webkit-perspective', '');

      fromView.$().css('-webkit-backface-visibility', '');

      toView.$().css('-webkit-transform', '');
      toView.$().css('-webkit-backface-visibility', '');
      
      var css = {
        '-webkit-transform-style':''
        , '-webkit-transition-property': ''
        , '-webkit-transition-duration': ''
        , '-webkit-transition-timing-function': ''
        , '-webkit-transition-delay': ''
        , '-webkit-transform': ''
      };

      transformView.$().css(css);
      //transformView.get('element').style['WebkitTransition'] = null;
      fn();

    }); 

  }


});

