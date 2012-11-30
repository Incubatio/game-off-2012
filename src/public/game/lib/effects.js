var gamejs = require('gamejs');
var $v = require('gamejs/utils/vectors');

// TODO: change the architecture to have at ~5 different layer (canvas)
// - at least 2 for background (close decors, and far horizon)
// - 1 for special effect that apply on background (e.g. blood)
// - 1 for sprites
// - 1 for special effect that act like an overlay (smoke, fog, light, ...)

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var Dismantle = exports.Dismantle = function(surface, options) {

  options = options || {};
  this.speed    = options.speed   || 150;
  this.minSize  = options.minSize || 2;
  this.maxSize  = options.maxSize || 10;
  this.lifetime = options.lifetime || 300; // ms
  this.reductionRate = options.reductionRate || 0.8; // per second
  this.pos = options.pos || [0, 0];
  this.direction = options.direction || [0, 0];
  this.size = options.size || surface.getSize();

  this.age = 0;

  this.parts = [];
  var size = surface.getSize();
  for (var i = 0; i < size[0]; ) {
     w = random(this.minSize, this.maxSize);
     for (var j = 0; j < size[1]; ) {
        h = random(this.minSize, this.maxSize);
        var s = new gamejs.Surface(w, h);
        s.blit(surface, new gamejs.Rect(0,0, w, h), new gamejs.Rect(i, j, w, h));
        this.parts.push({
           rect: new gamejs.Rect($v.add(this.pos, [i, j]), [w, h]),
           surface: s,
           v: $v.unit($v.add(this.direction, [random(-0.5,0.5), random(-0.5,0.5)]))
        });
        j += h;
     }
     i += w;
  }
}

Dismantle.prototype.update = function(msDuration) {
   for(var i = 0; i < this.parts.length; i++) {
      var p = this.parts[i];
      p.rect.center  = $v.add(p.rect.center, $v.multiply(p.v, (msDuration/1000) * this.speed));
      p.rect.width  *= (1 - (msDuration/1000) * this.reductionRate);
      p.rect.height *= (1 - (msDuration/1000) * this.reductionRate);
   }
   this.age += msDuration;
   surface = new gamejs.Surface(this.size[0], this.size[1]);
   return this.draw(surface);
}

Dismantle.prototype.draw = function(surface) {
   for(var i = 0; i < this.parts.length; i++) {
      var p = this.parts[i];
      var color = "rgba(255,0,0,0.6)";
      //surface.fill(color, p.rect);
      //surface.clear(p.rect);
      surface.blit(p.surface, p.rect);
   }
  return surface;
}
