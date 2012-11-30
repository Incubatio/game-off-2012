var gamejs = require("gamejs");

var Animation = exports.Animation = function(spriteSheet, animPatterns, options) {
  options  = options || {}; 
  this.fps = options.fps || 6;
  this.xflip = options.xflip || {};
  this.yflip = options.yflip || {};
  this.frameDuration = 1000 / this.fps;
  this.patterns = animPatterns;

  this.currentFrame = null;
  this.currentFrameDuration = 0;
  this.currentAnimation = null;

  this.spriteSheet = spriteSheet;
  this.finished = true;
  this.image = null;

  return this;
}

Animation.prototype.start = function(animName) {
  this.currentAnimation = animName;
  this.finished = false;
  this.currentFrame = this.patterns[animName][0];
  this.currentFrameDuration = 0;
  this.update(0);
  return;
};

Animation.prototype.update = function(ms) {
  if (!this.currentAnimation) {
    throw new Error('No animation started. Start("an animation") before updating');
  }
  var xflip = false, yflip = false, image, anim;

  this.currentFrameDuration += ms;
  if (this.currentFrameDuration >= this.frameDuration) {
    this.currentFrameDuration = 0;

    // Animation pattern Params
    anim = this.patterns[this.currentAnimation];
    /* var start = anim[0],
     * end       = anim[1],
     * isLooping = anim[2]; */

    // if Animation finished
    if (anim.length === 1 || this.currentFrame === anim[1]) {
      this.finished = true;
      // looping is considered as true if null (animation loop by default)
      if (anim[2] !== false) {
        this.currentFrame = anim[0];
      }
    } else {
        anim[0] < anim[1] ? this.currentFrame++ : this.currentFrame--;
    }
  }

  image = this.spriteSheet.get(this.currentFrame);

  // TODO: put flipped images in cache
  if(this.xflip[this.currentAnimation]) xflip = true;
  if(this.yflip[this.currentAnimation]) yflip = true;
  if(xflip || yflip) image = gamejs.transform.flip(image, xflip, yflip);

  return image;
};

