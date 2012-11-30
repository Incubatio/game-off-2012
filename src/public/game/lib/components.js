var gamejs = require('gamejs');


__hasProp = {}.hasOwnProperty;

exports.oldCreate = function (parent) {
    if(typeof parent !== 'object') {
      parent = (typeof parent === 'function') ? new parent() : {}; 
    }
    for (var i = 1; i < arguments.length; i += 1) {
        var sub = this[arguments[i]];
        for (var key in sub) { 
          if (__hasProp.call(parent, key)) parent[key] = sub[key]; 
        } 
    }
    return parent;
};

exports.create = function () {
    // Note: i don't like gamejs.sprite.Sprite dependancy
    // TOTHINK: make Base inherits from gamejs.sprite.Sprite
    var i = 0;
    if(arguments[0] instanceof gamejs.sprite.Sprite) { 
      parent = arguments[0];
      i = 1; 
    } else parent = new gamejs.sprite.Sprite();

    for (i; i < arguments.length; i += 1) {
        if(!this.hasOwnProperty(arguments[i])) throw Error(arguments[i] + ' is not a valid component name, please check the components file');
        var sub = this[arguments[i]];
        parent[arguments[i]] = true;

        // no check on hasOwnProperty, because no inheritance around here
        for (var key in sub) { 
          parent[key] = sub[key]; 
        } 
    }
    return parent;
};


// Base is useless except for initilisation, it's just a way to initilise from config the rect of gamejs.sprite.Sprite 
// TOTHINK: maybe add setImage to base, a function that will set the image and put dirty to true
// TOTHINK: define components in config yaml file, then compile to 
var Base = exports.Base = {
  //Base.superConstructor.apply(this, arguments);
  pos : false,
  size: false,
  setImage : function(image) {
    this.dirty = true;
    this.image = image;
  }
  //this.rect = new gamejs.Rect(pos, size);
};
//gamejs.utils.objects.extend(Base, gamejs.sprite.Sprite);

var Visible = exports.Visible = {
  /*this.constructor = function(image, options) {
    this.image = typeof image === "string" ? gamejs.image.load(image) = image;
    if(options.mask) this.mask = mask.fromSurface(this.image);
  },*/
  image_urn     : false,
  image         : false,
  originalImage : false,
  mask          :  false,
  color         : "#f00",
  dirty         : true
};

var Communicable = exports.Communicable = {
/*this.constructor = function(option) {
  if(typeof options.avatar === "string") {
    this.image_urn = options.avatar;
  }
  if(typeof options.dialogs === "object") {
    this.dialogs = dialogs;
  }
},*/
  avatar : "question.png",
  dialogs   : false
};

var Mobile = exports.Mobile = {
  speed : 0,
  moveX: 0,
  moveY: 0
};

var Jumpable = exports.Jumpable = {
  jumpSpeed : 4,
  jumpLimit: 150,
  jumpDistance: 0,
  isJumping: false,
  moveY: 0
};

var Rotative = exports.Rotative = {
  rotationSpeed : 10,
  rotation      : 0
};

var Flipable = exports.Flipable = {
  vertical   :  false,
  horizontal :  false
};

var Movable = exports.Movable =  {
  //alive : true
};

// Alive is already supported by GameJs
var Destructible = exports.Destructible =  {
// lifepoints
};


var Animated = exports.Animated = {
/*this.constructor = function(animation, options) {
  this.image = animation.spriteSheet.get(0);
  this.animation = animation;
  this.dirty = true;
}*/
  imageset  : false,
  frameset  : false,
  animation : false,
  dirty     : true
};

var Traversable = exports.Traversable = {
}

var Inteligent = exports.Inteligent = {
  pathfinding: 'straight', // none(human), random, sentinel, A*
  detectionRadius: 0
};

var Weaponized = exports.Weaponized = {
  behavior: 'offensive', // defensive, balanced
  alorithm: 'kamikaze', // none(human), fixed strategy, multiple strategy, alpha beta pruning
  attacking: false,
  weapon: 'sword'
  //attackRadius: 0,

};

//var Shieldable = exports.Shieldable = {

//};

