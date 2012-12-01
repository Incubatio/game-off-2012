var gamejs    = require('gamejs'),
    components  = require('lib/components');

// Render
var Rendering = exports.Rendering = function() {
  this.scaleRate = 1.5;
};

Rendering.prototype.update = function(sprite, ms) {
  if(sprite.Animated) {
    if(!sprite.animation.currentAnimation) {
      sprite.image = sprite.animation.spriteSheet.get(0); 
    }
  } 
};

Rendering.prototype.draw = function(gobject, surface, camera) {
  if(gobject.dirty && (gobject.Visible || gobject.Animated)) {
    // TODO: 2 different canvas, one for background, one for gobjects
    //this.clear(gobject, surface);

    if(camera.isVisible(gobject)) {
      if(this.scaleRate !== 1) {
        if(!gobject.scaled) {
          var size = gobject.rect ? [gobject.rect.width * this.scaleRate, gobject.rect.height * this.scaleRate] : [gobject.image.rect.width *this.scaleRate, gobject.image.rect.height * this.scaleRate];
          var pos = gobject.rect ? [gobject.rect.left * this.scaleRate, gobject.rect.top * this.scaleRate] : [0, 0];
          gobject.rect = new gamejs.Rect(pos, size);
          gobject.scaled = true;
        }
      }

      var offset = [0, 0];
      var rect = gobject.rect.move(camera.getOffset());
      gobject.image ? surface.blit(gobject.image, rect, offset) : surface.fill(gobject.color, rect);

      //image = gobject.image;
    }
  }
    gobject.dirty = false;
};

Rendering.prototype.clear = function(sprite, surface, camera) {
  var offset = camera.getOffset();
  if(sprite.oldRect) {
    var oldRect = sprite.oldRect.move(camera.getOffset());
    surface.clear(oldRect);
    //surface.clear(sprite.rect);
      if(sprite.oldImage) {
      //var oldRect = sprite.oldRect;
        //clear font without bg
        //surface.fill('#f00', sprite.rect);
        //clear font with bg
        surface.blit(sprite.oldImage, oldRect) 
      }
  }
  //sprite.oldRect = sprite.rect.move(offset);
  sprite.oldRect = sprite.rect.clone();
  //size = (this.animation.image) ? this.animation.image.getSize() : this.image.getSize();
  size = sprite.image ? sprite.image.getSize() : [sprite.rect.width, sprite.rect.height];
  //size = [sprite.rect.width, sprite.rect.height];
    
  imgSize = new gamejs.Rect([0,0], size);
  mySurface = new gamejs.Surface(size);
  
  //var rect = sprite.rect.clone();
  var rect = sprite.rect.move(camera.getOffset());
  //if(sprite.name == 'box2') console.log(oldRect.topleft, rect.topleft, rect2.topleft )
  //rect = new gamejs.Rect(pos, size);
  var size = surface.getSize();
  if(rect.left + rect.width < size[0] && rect.top + rect.width < size[1] && rect.left > size[0] && rect.top > size[1]) {
    mySurface.blit(surface, imgSize, rect);
    sprite.oldImage = mySurface;
  }
};

Rendering.prototype.drawBackground = function(director) {
  if(director.map) {
    director.surface.clear();
    var image = director.map.visibleLayers.collision.image;
    var rect = new gamejs.Rect([0,0], image.getSize());
    var bg = {rect: rect, dirty: true, Visible: true}
    if(director.dark) {
      bg.color = "#000";
    } else {
      if(this.scaleRate != 1 && !director.map.scaled) {
        director.map.tileHeight = director.map.tileHeight*this.scaleRate;
        director.map.tileWidth = director.map.tileWidth*this.scaleRate;
        director.map.size = [director.map.size[0] * this.scaleRate, director.map.size[1] * this.scaleRate];
        director.map.scaled = true;
      }
      bg.image = image;
    }
      
      //var rect = new gamejs.Rect(director.camera.getOffset(), image.getSize());
    
    this.draw(bg, director.surface, director.camera);
  }
 // director.surface.blit(director.map.visibleLayers.decor.image);
  director.camera.dirty = false;
};


// Transform Rotation
var Rotation = exports.Rotation = function() {
};
Rotation.prototype.update = function(sprite){
    if(sprite.Rotative && sprite.originalImage) {
      sprite.rotation += sprite.rotationSpeed;
      sprite.image = gamejs.transform.rotate(sprite.originalImage, sprite.rotation); 
      sprite.dirty = true;
    }
};

var Movement = exports.Movement = function() {
};
Movement.prototype.update = function(sprite, ms, director) {
  if(sprite.Mobile && (sprite.moveX != 0 || sprite.moveY != 0)) { 
    sprite.dirty = true;
    var moveX, moveY, coef;
    // Handle animations that depends on moves
    if(sprite.Animated) { //&& sprite.animation.currentAnimation != 'pause') {
      // TODO: seperate animation from orientation ?
      var animation;
        if(sprite.moveX < 0) {
          animation = "left";
        } else if(sprite.moveX > 0) {
          animation = "right";
        } else if(sprite.moveY < 0) {
          animation = "up";
        } else if(sprite.moveY > 0) {
          animation = "down";
        } else {
          animation = "pause";
          //delete animation;
          //sprite.image = sprite.animation.spriteSheet.get(0);
        }
        if(animation && animation !== sprite.animation.currentAnimation){
          sprite.animation.start(animation);
        }
        sprite.image = sprite.animation.update(30);
      }


    // TODO: remove hack that create a second smaller rect for collision, and separate in config drawing rect of collide rect.
    var oldRect, size, x, y;
    oldRect = sprite.rect;
    size = [oldRect.width / 2.5, oldRect.height / 2]
    hackRect = new gamejs.Rect([Math.floor(oldRect.left + (size[0]/2)), Math.floor(oldRect.top + (size[1]/2))], size );  
    sprite.rect = hackRect;

    // TODO: Maybe manage mobile object while pressing a key that will put the user in a pushing/pulling position
    x = sprite.moveX * sprite.speed;
    y = sprite.moveY * sprite.speed;


    sprite.rect.moveIp(x, 0);
    if(Collision.isColliding(sprite, director, x, y)) {
       x = 0;
       sprite.rect = hackRect;
    }

    sprite.rect.moveIp(0, y);
    if(Collision.isColliding(sprite, director, x, y)) {
      y = 0;
      sprite.rect = hackRect;
    }

    sprite.rect = oldRect;
    sprite.rect.moveIp(x, y);
    collisions = gamejs.sprite.spriteCollide(sprite, director.scene.spriteGroup);
    _.each(collisions, function(sprite2, k) {
      if(!sprite2.Traversable) sprite2.dirty = true;
    });

  }
};

Collision = exports.Collision = {

  isColliding : function(sprite, director, x, y) {
    var isColliding2 = true;
    if(!director.map.isColliding(sprite.rect)) {
      director.scene.spriteGroup.remove(sprite);
      var collisions = gamejs.sprite.spriteCollide(sprite, director.scene.spriteGroup);
      if(!(collisions.length > 0 && sprite.Movable)) {
        isColliding2 = false;
        
        for(var i = 0; i < collisions.length; i++) {
          var sprite2 = collisions[i];
          if(sprite2.Traversable) continue;
          sprite2.dirty = true;
          if(sprite2.Movable) { 
            sprite2.rect.moveIp(x, y);
            if(Collision.isColliding(sprite2, director)) {
              sprite2.rect.moveIp(-x, -y);
              isColliding2 = true;
            }; 
          } else isColliding2 = true;
        } 

      } else {
        // TODO: rapid hack to manage traversable, but traversable should be in a different sprite group
        for(var i = 0; i < collisions.length; i++) {
          var sprite2 = collisions[i];
          //TODO:: rapid hack for trigger
          if(sprite2.Triggerable) sprite2.triggered = true;
          if(!sprite2.Traversable) {
            isColliding2 = true;
            break;
          } else isColliding2 = false;
        }
        
      }
      director.scene.spriteGroup.add(sprite);
    } 
    
    return isColliding2;
  }
};


var Weapon = exports.Weapon = function() {
}
Weapon.prototype.update = function(sprite, ms, director) {
  if(sprite.Weaponized && sprite.attacking) {
    var weapon = director.scene.sprites[sprite.weapon]
  
    // if animation is finished disabled attacking state


      // test for current animation and if not exists, start it
      if(!weapon.animation.currentAnimation) {
        console.log(sprite.animation.currentAnimation);
        var animation = (!sprite.animation.currentAnimation || sprite.animation.currentAnimation === "pause") ? "down" : sprite.animation.currentAnimation;
        weapon.animation.start(animation);
      //Rendering.clear(weapon, director.display);
      weapon.oldImage = undefined;
      }

    // test for collision, apply hit
    var collisions = gamejs.sprite.spriteCollide(weapon, director.scene.spriteGroup);
    _.each(collisions, function(sprite2, k) {
      if(sprite2.Destructible) {
        director.surface.clear(sprite2.rect);
        sprite2.kill(); 
      }
    });
    
    // TODO: push ennemy on hit
    // TODO: if ennemy is comming double hit, immobile normal hit, backing = 1/2 hit


    // Check if animation is finished, if not update image
    if(weapon.animation.finished) {
      sprite.attacking = false;
      weapon.animation.currentAnimation = undefined;
      weapon.dirty = false;
      weapon.rect.moveIp([- (sprite.rect.left + sprite.rect.width*2), - (sprite.rect.top + sprite.rect.height*2)]);
    } else {
      weapon.dirty = true;
      weapon.rect.moveIp(sprite.rect.left - weapon.rect.left, sprite.rect.top - weapon.rect.top);
      weapon.image = weapon.animation.update(60);
    }

  }
}

var Trigger = exports.Trigger = function() {
}
Trigger.prototype.update = function(sprite, ms, director) {
  if(sprite.Triggerable && sprite.triggered === true) {
    if(sprite.name == 'vortex') {
      var collisions = gamejs.sprite.spriteCollide(sprite, director.scene.spriteGroup);
      for(var i = 0; i < collisions.length; i++) {
        var sprite2 = collisions[i];
        if(sprite2.Movable) {
          sprite2.rect.moveIp([-500, -500]);
          sprite2.kill();
          //director.scene.sprites[sprite2.name] = false;
          director.sceneLoader.socket.emit('transfer cube'); 
        }
      }

    }
    sprite.triggered = false;

  }
}
