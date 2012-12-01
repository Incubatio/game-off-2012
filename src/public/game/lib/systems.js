var gamejs    = require('gamejs'),
    components  = require('lib/components');

// Render
var Rendering = exports.Rendering = function() {
  this.scaleRate = 1;
};

Rendering.prototype.update = function(sprite, ms) {
  if(sprite.Animated) {
    if(!sprite.animation.currentAnimation) {
      sprite.image = sprite.animation.spriteSheet.get(0); 
    } else if(sprite.name == 'hammer' && sprite.busy === true)  {
      if(!sprite.animation.finished)  player.image = sprite.animation.currentAnimation == "hit" ? player.animation.update(100) : player.animation.update(50);
      else if(sprite.animation.currentAnimation === 'hit') sprite.animation.start('back');
      else sprite.busy = false;
    }
  } 
};

Rendering.prototype.draw = function(gobject, director) {
  if(gobject.dirty && (gobject.Visible || gobject.Animated)) {
    // TODO: 2 different canvas, one for background, one for gobjects
    //this.clear(gobject, surface);

    // Color inversion
    var surface = director.surface;
    if(gobject.color) {
      var color = gobject.color;
      if(!director.dark) {
        //TODO: properly invert color: remove #, convert to integer, etc..
        // Maybe directly add feature in gamejs.transform

        if(color === "#fff") color = "#000";
        else if(color === "#000") color = "#fff";
      }
    }


    // Scaling
    if(this.scaleRate !== 1) {
      if(!gobject.scaled) {
        var size = gobject.rect ? [gobject.rect.width * this.scaleRate, gobject.rect.height * this.scaleRate] : [gobject.image.rect.width *this.scaleRate, gobject.image.rect.height * this.scaleRate];
        var pos = gobject.rect ? [gobject.rect.left * this.scaleRate, gobject.rect.top * this.scaleRate] : [0, 0];
        gobject.rect = new gamejs.Rect(pos, size);
        gobject.scaled = true;
      }
      surface.blit(gobject.image, gobject.rect);
    } else {  //surface.blit(gobject.image, gobject.rect);
      if(gobject.circle) gamejs.draw.circle(surface, color, [gobject.rect.left + gobject.rect.width/2, gobject.rect.top + gobject.rect.height/2], gobject.circle.radius);
      else gobject.image ? surface.blit(gobject.image, gobject.rect) : surface.fill(color, gobject.rect);
    }

    

    //image = gobject.image;
  }
    gobject.dirty = false;
};

Rendering.prototype.clear = function(sprite, surface) {
  if(sprite.oldImage) {
    //clear font without bg
    surface.clear(sprite.oldRect);
    //surface.fill('#f00', sprite.rect);
    //clear font with bg
    surface.blit(sprite.oldImage, sprite.oldRect) 
  }
  sprite.oldRect = sprite.rect.clone();
  //size = (this.animation.image) ? this.animation.image.getSize() : this.image.getSize();
  var size = [sprite.rect.width, sprite.rect.height];
    
  width = size[0];
  height = size[1];
  imgSize = new gamejs.Rect([0,0], size);
  mySurface = new gamejs.Surface(size);
  rect = new gamejs.Rect(sprite.rect.left, sprite.rect.top, width, height);
  mySurface.blit(surface, imgSize, rect);
  sprite.oldImage = mySurface;
};

Rendering.prototype.drawBackground = function(director) {
  if(director.map) {
    director.surface.clear();
    if(this.scaleRate != 1 && !director.map.scaled) {
      var image = director.map.visibleLayers.decor.image;
      director.map.tileHeight = director.map.tileHeight*this.scaleRate;
      director.map.tileWidth = director.map.tileWidth*this.scaleRate;
      director.map.size = [director.map.size[0] * this.scaleRate, director.map.size[1] * this.scaleRate];
      director.map.scaled = true;
    }
    this.draw({image: image, dirty: true, Visible: true}, director.surface);
  } else if(director.scene.bgImage) director.surface.blit(director.scene.bgImage, new gamejs.Rect([0,0], director.surface.getSize()));
  else {
    console.log('bg:', director.dark);
    (director.dark) ? director.surface.fill('#000') : director.surface.fill('#fff');
  }

  director.scene.dirty = false;
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



    // Really dirty jump
    // TODO apply gravity equation on jumping
    if(sprite.Jumpable) {
      sprite.moveY = 1;
      if(sprite.isJumping) { 
        if(sprite.jumpDistance >= sprite.jumpLimit) {
           sprite.isJumping = false;
        } else {  
          sprite.moveY = -1;
        }
      }
    }

    

    // check mover for collision with other sprites for x and y:
    // - if has 1 collision and object movable: check move for movable object
    // - if move ok, move 
    // - if move not ok, do not move

    //coef = Math.abs(moveX) + Math.abs(moveY);
    //sprite.rect.moveIp(moveX * sprite.speed / coef, moveY * sprite.speed / coef);

    // TODO: remove hack that create a second smaller rect for collision, and separate in config drawing rect of collide rect.
    var oldRect, size, x, y;
    oldRect = sprite.rect.clone();
    size = [oldRect.width / 2.5, oldRect.height / 2]
    //hackRect = new gamejs.Rect([Math.floor(oldRect.left + (size[0]/2)), Math.floor(oldRect.top + (size[1]/2))], size );  
    //sprite.rect = hackRect;

    // TODO: Maybe manage mobile object while pressing a key that will put the user in a pushing/pulling position
    x = sprite.moveX * sprite.speed;
    y = sprite.moveY * sprite.speed;



    sprite.rect.moveIp(x, 0);
    if(Collision.isColliding(sprite, director, x, y)) {
      if(sprite.name === 'ball') {
        x = -x;
        sprite.moveX = -sprite.moveX; 
        sprite.speed++;
      }
      //sprite.rect = hackRect;
      sprite.rect = oldRect.clone();
    }

    sprite.rect.moveIp(0, y);
    if(Collision.isColliding(sprite, director, x, y)) {
      y = 0;
      //sprite.rect = hackRect;
      if(sprite.Jumpable && sprite.isJumping || sprite.jumpDistance != 0) {
        sprite.isJumping = false;
        sprite.jumpDistance = 0;
        
      }
      sprite.rect = oldRect;
    }
    if(sprite.Jumpable && sprite.isJumping) sprite.jumpDistance -= y;
    else if(sprite.jumpDistance > 0) sprite.jumpDistance -= y;

    //TODO: manage properly collisions
    //surfaceRect = gamejs.display.getSurface().getRect();
    function  isOutOfY(sprite, director) {
      var rect = sprite.rect;
      var size = director.surface.getSize();
      return rect.top < sprite.speed || (rect.top + rect.height) >= size[1] - sprite.speed;
    }
    function  isOutOfX(sprite, director) {
      var rect = sprite.rect;
      var size = director.surface.getSize();
      return rect.left < sprite.speed || (rect.left - rect.width) >= size[0] - sprite.speed;
    }

    if(isOutOfX(sprite, director)) {
      console.log(sprite.rect.left, sprite.rect.width);
      if(sprite.name === "ball") sprite.rect.left < 100 ? director.loosePong() : director.winPong();
      else {
         x = 0;
      }
    }
    if(isOutOfY(sprite, director)) {
      if(sprite.name === "ball") sprite.moveY = - sprite.moveY;
      else {
        y = 0;
      }
    }

    sprite.rect = oldRect;
    sprite.rect.moveIp(x, y);
    collisions = gamejs.sprite.spriteCollide(sprite, director.scene.spriteGroup);
    if(collisions && sprite.name == "player" && sprite.rect.collideRect(director.scene.sprites.door.rect)) this.director.winOiram();
    _.each(collisions, function(sprite2, k) {
      sprite2.dirty = true;
    });

  }
};

Collision = exports.Collision = {

  isColliding : function(sprite, director, x, y) {
    var isColliding2 = true;
    if(!director.map || !director.map.isColliding(sprite.rect)) {
      director.scene.spriteGroup.remove(sprite);
      var collisions = gamejs.sprite.spriteCollide(sprite, director.scene.spriteGroup);
      if(!(collisions.length > 0 && sprite.Movable)) {
        isColliding2 = false;
        
        for(var i = 0; i < collisions.length; i++) {
          var sprite2 = collisions[i];
          sprite2.dirty = true;
          if(sprite2.Movable) { 
            sprite2.rect.moveIp(x, y);
            if(Collision.isColliding(sprite2, director)) {
              sprite2.rect.moveIp(-x, -y);
              isColliding2 = true;
            }; 
          } else isColliding2 = true;
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
