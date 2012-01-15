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


