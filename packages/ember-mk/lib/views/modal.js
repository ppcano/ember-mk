
require("ember-mk/core");
require("ember-mk/mixins/animatable");
require("ember-mk/animation/animation_style");


Mk.ModalView = Ember.Mixin.create(Mk.Animatable, {

  position: null,
  move: null,
  defaultHidden: true,
  duration: 1000,
  animationStyle: Mk.AnimationStyle.FROM_RIGHT,


  didInsertElement: function() {

    this._super();

    if ( this.defaultHidden ) {

      this.set('isVisible', false);

      if ( this.animationStyle !== Mk.AnimationStyle.NONE ) {

        var position;
        var val;

        if ( this._isHorizontalAnimation() ) {

          this.move = $(window).width();
          position = this.move;


          if ( this.animationStyle  === Mk.AnimationStyle.FROM_LEFT ) {
            position = position*(-1);
          }

          val = {x: position};

        } else {

          this.move = $(window).height();
          position = this.move;

          if ( this.animationStyle  === Mk.AnimationStyle.FROM_UP ) {
            position = position*(-1);
          }

          val = {y: position};

        }


        this.animate({},val, function(me) {
                   
          me.set('isVisible', true);
          me.set('position', position);

        }); 




      }

    }

  },

  toogle: function() {

    if ( this.animationStyle !== Mk.AnimationStyle.NONE ) {

      var position = this.get('position');
      var val;

      position = ( position !== 0 ) ? 0 : this.move; 

      if ( this.animationStyle === Mk.AnimationStyle.FROM_UP || this.animationStyle === Mk.AnimationStyle.FROM_LEFT ) {
        position = position*(-1);
      }

      var val = ( this._isHorizontalAnimation() ) ? {x: position}:{y: position};

      this.animate({duration: this.duration}, val );
      this.set('position', position);

    } else {

      var isVisible = this.get('isVisible'); 
      this.set('isVisible', !isVisible);

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


