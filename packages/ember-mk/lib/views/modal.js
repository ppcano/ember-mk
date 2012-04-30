
require("ember-mk/core");
require("ember-mk/mixins/animatable");
require("ember-mk/animation/animation_style");


Mk.ModalView = Ember.Mixin.create(Mk.Animatable, {

  position: null,
  move: null,
  defaultHidden: true,
  duration: 1000,
  animationStyle: Mk.AnimationStyle.FROM_RIGHT,
  stopEventHandling: true,
  isVisibleModal: false,


  didInsertElement: function() {

    this._super();

    var isVisibleModal;

    if ( this.defaultHidden ) {

      this.set('isVisible', false);

      if ( this.animationStyle !== Mk.AnimationStyle.NONE ) {

        var position, val;

        if ( this._isHorizontalAnimation() ) {

          if ( !this.move ) {
            this.move = $(window).width();
          }
          position = this.move;


          if ( this.animationStyle  === Mk.AnimationStyle.FROM_LEFT ) {
            position = position*(-1);
          }

          val = {x: position};

        } else {

          if ( !this.move ) {
            this.move = $(window).height();
          }
          position = this.move;

          if ( this.animationStyle  === Mk.AnimationStyle.FROM_UP ) {
            position = position*(-1);
          }

          val = {y: position};

        }

        this.$().css(val); 
        this.set('isVisible', true);
        this.set('position', position);

      }

      isVisibleModal = false;

    } else {

      isVisibleModal = true;

    }


    this.set('isVisibleModal', isVisibleModal );

  },

  toogle: function(fn) {

    if ( this.animationStyle !== Mk.AnimationStyle.NONE ) {

      var position = this.get('position');
      var val;

      position = ( position !== 0 ) ? 0 : this.move; 

      if ( this.animationStyle === Mk.AnimationStyle.FROM_UP || this.animationStyle === Mk.AnimationStyle.FROM_LEFT ) {
        position = position*(-1);
      }

      var val = ( this._isHorizontalAnimation() ) ? {x: position}:{y: position};
      var self = this;

      this.animate({duration: this.duration, stopEventHandling: this.stopEventHandling}, val, function() {

        if ( fn ) fn();
        self.set('isVisibleModal', position === 0 );
                 
      });
      this.set('position', position);

    } else {

      var isVisible = this.get('isVisible'); 
      this.set('isVisible', !isVisible);

      if ( fn ) fn(this);

      this.set('isVisibleModal', !isVisible);

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


