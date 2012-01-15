
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

