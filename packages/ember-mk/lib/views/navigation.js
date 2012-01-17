var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;


Mk.NavigationItemView = Em.Mixin.create({

  classNames: ['nav_item'],

  rootView: SC.computed(function() {
    return this.nearestInstanceOf(Mk.NavigationView);
  }).property(),

  didInsertElement: function() {

    this._super();
    var root = this.get('rootView');

    var width = root.get('width');
    var height = root.get('height');

    this.$().height(height);
    this.$().width(width);

    // move to main view logic by observing insertions
    root.get('stack').updateWidth();
    root.move(true);

  }

});

// TODO: performance should be improved, which a solution like SwipeView
// API, should still be the same
Mk.NavigationView = Ember.ContainerView.extend(Mk.Animatable, {

  duration: 1000,
  classNames: ['nav'],

  width: null,
  height: null,

  hasBack: Ember.computed( function() {
    return this.get('_hasBack');
  }).property('_hasBack'),

  _position: null,
  _hasBack: true,

  childViews: ['stack'],

  stack: Em.ContainerView.extend({
    /*
    hasBack: Ember.computed( function() {
      return this.get('_childViews').get('length') > 1;
    }).property('_childViews.@each'),
    */
    didInsertElement: function() {

      this.$().height(getPath(this, 'parentView.height'));
    },

    updateWidth: function(){
      var width = getPath(this, 'parentView.width');
      var length = this.get('childViews').get('length');
      this.$().width(length*width);
    }

  }),

  didInsertElement: function() {

    var height = this.$().height( );
    var width = this.$().width( );

    this.set('height', height);
    this.set('width', width);

  },


  move: function(hasBeenInsertedElement, callback) {
    var position = this.get('_position');


    if ( position === null ) {
       position = 0;
    } else {

      var width = this.get('width');
      position += (hasBeenInsertedElement) ? width*(-1): width;

      this.animate({duration: this.duration}, {x: position}, function() {

          if ( callback ) {
            callback();
          }

      });
    }

    this.set('_position', position);
  },


  pushView: function(newView) {

    //set(newView, 'root', this);  done with nearestInstanceOf 
    //this.appendChild(newView);--> exception cannot append out of
    //rendering process
		
    var child = this.get('stack').get('childViews');
    set(newView, '_parentView', this);
    child.pushObject(newView);

  },

  popView: function(animated) {
    // childViews is mutable_array
    // - removeObject// AddObject  
    
    var that = this; 

    this.move(false, function() {

      var child = that.get('stack').get('childViews');
      var view = child.popObject();
			view.destroy();
      that.get('stack').updateWidth();

    });

  }

});
