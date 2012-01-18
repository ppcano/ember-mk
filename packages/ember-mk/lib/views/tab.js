require("ember-mk/core");

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

