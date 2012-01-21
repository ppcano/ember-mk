
require("ember-mk/core");

Mk.AnimationStyle = {
  NONE: 0
  , FROM_DOWN: 1
  , FROM_UP: 2
  , FROM_LEFT: 3
  , FROM_RIGHT: 4
  , FLIP_FROM_LEFT: 5
  , FLIP_FROM_RIGHT: 6
  , FLIP_FROM_UP: 7
  , FLIP_FROM_DOWN: 8
};


Mk.AnimationStyle.isFlip = function(val) {
  return ( val === Mk.AnimationStyle.FLIP_FROM_UP || 
       val === Mk.AnimationStyle.FLIP_FROM_DOWN ||
       val === Mk.AnimationStyle.FLIP_FROM_RIGHT ||
       val === Mk.AnimationStyle.FLIP_FROM_LEFT );
};
