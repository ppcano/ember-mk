
require("ember-mk/core");
require("ember-mk/mixins/animatable");

var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;

Mk.NavigationItemView = Em.Mixin.create({

  classNames: ['nav_item'],

  rootView: Em.computed(function() {
    return this.nearestInstanceOf(Mk.NavigationView);
  }).property(),

  didInsertElement: function() {

    this._super();
    var root = this.get('rootView');
    // TODO: perhaps there is a better way to do that.
    root.didInsertStackChild(this);
  }

});


// TODO: better way to handle hasBack option to be shown. 
Mk.NavigationView = Ember.ContainerView.extend(Mk.Animatable, {

  duration: 1000,
  classNames: ['nav'],
  /* 
  * When true push/popViews won't be executed.
  */
  isMoving: false,

  width: null,
  height: null,

  hasBack: Ember.computed( function() {
    return this.get('_hasBack');
  }).property('_hasBack'),

  _transform: null,
  _hasBack: false,
  position: -1,

  _stack: Ember.A([]),

  childViews: ['stack'],

  stack: Em.ContainerView.extend({

    didInsertElement: function() {

      this._super();
      this.$().height(getPath(this, 'parentView.height') );
      this.$().width(3*getPath(this, 'parentView.width') );

    }

  }),

  didInsertElement: function() {

    var height = this.$().height( );
    var width = this.$().width( );
    this.set('height', height);
    this.set('width', width);

  },

  didInsertStackChild: function(view){
    
    var position = this.get('position')
      , left;
    
    if ( !this._stack.contains( view ) ) {

      this._stack.pushObject(view);
      position++; 
      left = position*100+'%';
      view.$().css("left", left); 
      this._move(true);

    } else {
      position--; 
      left = (position-1)*100+'%';
      view.$().css("left", left); 
    }

    this.set('position', position);
    
  },

  pushView: function(newView) {

    if ( !this.get('isMoving') ) {

      this.set('isMoving', true );
      this.set('_hasBack', this._stack.get('length')+1 > 1);

      var stackView =  this.get('stack');
      set(newView, '_parentView', stackView );

      var child = stackView.get('childViews');
      child.pushObject(newView);

      if ( child.get('length') === 3 ) {
        child.shiftObject();
      }

    }

  },

  popView: function(animated) {
    
    var child =  this.get('stack').get('childViews');

    if ( child.get('length') <= 1 ) {
      throw new Error(' cannot popView');
    }


    if ( !this.get('isMoving') ) {

      this.set('isMoving', true );
      this.set('_hasBack', this._stack.get('length')-1>1);

      var that = this;
      this._move(false, function () {

        var view = that._stack.popObject();
        var length = that._stack.get('length'); 

        if ( length > 1 ) {

          var backView = that._stack[length-2];
          child.unshiftObject(backView);

        } else { // because didInsertStackChild won't be fired

          that.set('position', that.get('position') - 1 );

        }

        var view = child.popObject();
        view.destroy();

      });
    }

  },

  _move: function(hasBeenInsertedElement, callback) {
    var transform = this.get('_transform');

    if ( transform === null ) {
       transform = 0;
       this.set('isMoving', false);
    } else {
      var width = this.get('width');
      transform += (hasBeenInsertedElement) ? width*(-1): width;

      var that = this;
      this.animate({duration: this.duration, stopEventHandling:true}, {x: transform}, function() {

          if ( callback ) {
            callback();
          }

          that.set('isMoving', false);

      });
    }

    this.set('_transform', transform);

  }

});
