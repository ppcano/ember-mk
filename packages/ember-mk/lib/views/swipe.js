
require("ember-mk/core");
require("ember-mk/mixins/animatable");

var get = Ember.get , set = Ember.set, setPath = Ember.setPath, getPath = Ember.getPath;

// Based on SwipeView approach of Matteo Spinelli
Mk.SwipeView = Ember.ContainerView.extend(Mk.Animatable,{
  
  itemViewClass: Em.View,

  contentIndex: 0,
  duration: 500,

	swipeOptions: {
		direction: Em.OneGestureDirection.Left | Em.OneGestureDirection.Right,
		cancelPeriod: 100,
		simultaneously: true,
		swipeThreshold: 20,
		initThreshold: 10
	},

  width: 320,
  selected: null,
  content: null,

  //--- private properties
  isMoving: false,
  translatePosition: 0,

	activeIndex: null,
	activeLeftCss: null,


  init: function(){

    this._super();

		var itemViewClass = this.get('itemViewClass');

		if (Em.typeOf(itemViewClass) === "string") {
			itemViewClass = Em.getPath(itemViewClass);
			set(this, 'itemViewClass', itemViewClass);
		}

		var content = get(this, 'content');
    if (Em.typeOf(content) === "string") {
      content = Em.getPath(content);
      set(this, 'content', content);
    }


		var self = this;
			
		['-100%', '0%', '100%'].forEach(function(item) {

			var view = self.createChildView(itemViewClass, {});
			self.get('childViews').pushObject(view);
			view.on('didInsertElement', function() {
				view.$().css("left", item); 
			});

		});

  },

	_reorderContent: function() {

		var content = this.get('content');
		var selected = this.get('selected');

		if ( !!content && !!selected ) {

			var i = content.get('length'), 
				isSelectedInContent = false;

			// content.some does not work, why?
			while( !isSelectedInContent && i-- ) {
				isSelectedInContent = (content.objectAt(i) === selected);
			}

			if ( isSelectedInContent ) {

				if ( !this.get('isMoving') ) {

					this.set('contentIndex', i );
					this.set('activeIndex', 1 );
					this.set('activeLeftCss', 0);
					this.set('translatePosition', 0);

					var contentIndex = this.get('contentIndex'),
							index = this.get('activeIndex'),
							tmpIndex,
							tmpContentIndex,
							child = this.get('childViews');

					tmpContentIndex = this._getContentIndex(false); 
					tmpIndex = this._getIndex(false); 
					child[tmpIndex].set('content', content.objectAt(tmpContentIndex) );

					child[index].set('content', content.objectAt(contentIndex) );

					tmpContentIndex = this._getContentIndex(true); 
					tmpIndex = this._getIndex(true); 
					child[tmpIndex].set('content', content.objectAt(tmpContentIndex) );


				} else {

					this.set('isMoving', false);

				}

			}

		}

	},



	swipeEnd: function(recognizer) {

			
    var length = this.getPath('content.length');

		if ( length > 1 ) {

			var self = this;
			if ( recognizer.swipeDirection === Em.OneGestureDirection.Left ) {
					this.moveNext( function() {
						//self.unblockGestureRecognizer();
					});

			} else if ( recognizer.swipeDirection === Em.OneGestureDirection.Right ) {

					this.moveBack( function() {
						//self.unblockGestureRecognizer();
					});

			}

		}

	},

	moveBack: function(fn){
		this._move(false, fn);
	},

	moveNext: function(fn){
		this._move(true, fn);
	},


  _move: function(next, fn) {

    if ( !this.get('isMoving') ) {

				// it will be updated on setup content index
				this.set('isMoving', true );

        var self = this;

				var activeLeftCss= this.get('activeLeftCss');
				activeLeftCss = ( next )  ? activeLeftCss+1 : activeLeftCss-1;
				this.set('activeLeftCss', activeLeftCss);

				this.set('contentIndex', this._getContentIndex(next) );
				this.set('activeIndex', this._getIndex(next) );

				var width = this.get('width');
				var translatePosition = this.get('translatePosition');
				translatePosition += (next) ? width*(-1): width;

				this.animate( {duration: this.duration, stopEventHandling:true}, {x: translatePosition}, function() {

						var left, leftIndex, rightIndex, leftContentIndex, rightContentIndex, contentIndex;

						var activeLeftCss = self.get('activeLeftCss');

						var child = self.get('childViews');
						var content = self.get('content');

						leftIndex = self._getIndex(false);

						rightIndex = self._getIndex(true);


						leftContentIndex = self._getContentIndex(false);
						contentIndex = self.get('contentIndex');
						rightContentIndex = self._getContentIndex(true);

						left = (activeLeftCss-1)*100+'%';
						child[leftIndex].$().css("left", left); 

						left = (activeLeftCss+1)*100+'%';
						child[rightIndex].$().css("left", left); 

						child[leftIndex].set('content', content.objectAt(leftContentIndex) );
						child[rightIndex].set('content', content.objectAt(rightContentIndex) );


						self.set('translatePosition', translatePosition);



						if ( fn ) fn();

            //console.log( content.objectAt(contentIndex) );
            self.set('selected', content.objectAt(contentIndex) );

				});
		}

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

    var length = this.getPath('content.length');
		var result = this.get('contentIndex');
    result +=(next) ? 1:-1; 

    if ( result < 0 ) { 
      result = length-1;
    } else if ( result > length-1 ) { 
      result = 0;
    }

    return result;
  },


	_contentChanged: Ember.observer( function() {

		this._reorderContent();

	}, 'content'),

	_selectedChanged: Ember.observer( function() {

		this._reorderContent();

	}, 'selected')



});
