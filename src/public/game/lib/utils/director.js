var gamejs      = require('gamejs'),
    animation   = require('lib/utils/animation'),
    components  = require('lib/components'),
    systems     = require('lib/systems');
    particles   = require('lib/particles');
    Dismantle   = require('lib/effects').Dismantle;

// USE socket.io event for loading game scenes
var SceneLoader = exports.SceneLoader = function(socket) {
  this.socket = socket;
}

SceneLoader.prototype.get = function(sceneName, callback) {
  console.log("scene: " + sceneName);
  //Load scene
  this.socket.emit('get scene', {
    name: sceneName
  });
};

var Camera = function(surface, options) {
  options = options || {};
  this.x = options.x || 0;
  this.y = options.y || 0;
  // interval between screen, it's best if i = max(hero.width, hero.height)
  this.i = options.i || 64;
  this.dirty = false;
  this.surface = surface;
}
Camera.prototype.isVisible = function(gobject) {
  return gobject.rect.collideRect(this.getScreenRect());
}
Camera.prototype.getOffset = function() {
  var offset =  this.getScreenRect().topleft;
  return [-offset[0], -offset[1]];
}

Camera.prototype.getScreenRect = function() {
  var left, top, size, i;
  size = this.surface.getSize();
  i = this.i;

  function a(n, m) {
    return n * m - (n > 0 ? i * n : 0);
  }

  left = a(this.x, size[0]);
  top = a(this.y, size[1]);

  return new gamejs.Rect([left, top], size);
}

// TODO: follow could be call one time to be bound to some game object, and then the rest of the code should be placed in a update method ish
Camera.prototype.follow = function(sprite) {
  var surface = this.surface;
  var rect = sprite.rect;
  var screenRect = this.getScreenRect();
  var x = this.x, y = this.y;
       if(sprite.moveY < 0 && rect.top < screenRect.top) y--;
  else if(sprite.moveY > 0 && rect.top + rect.height > screenRect.top + screenRect.height) y++;
  else if(sprite.moveX < 0 && rect.left < screenRect.left) x--;
  else if(sprite.moveX > 0 && rect.left + rect.width > screenRect.left + screenRect.width) x++;
  if(x != this.x || y != this.y) {
    this.dirty = true;
    this.x = x;
    this.y = y;
  }
}

//TOTHINK: Manage screen size in scenes ?
var Director = exports.Director = function(sceneLoader, sceneReader, options) { 

  this.MENU    = 1;
  this.LOADING = 2;
  this.RUNNING = 3;
  this.PAUSE   = 4;
  this.CONSOLE = 5;

  options    = options || {};
  var size   = options.screen.size || [800, 600];
  var font   = options.font || '20px monospace';

  this.map   = options.map;
  this.status = 'shutdown';

  this.systems = {};
  for (var i = 0; i < options.systems.length; i += 1) {
    this.systems[options.systems[i]] = new systems[options.systems[i]]();
    //this.systems[] = new systems[options.systems[i]]();
  }

  this.prefixs = options.prefixs || {image: "", sound: "", library: ""}

  // Surface
  this.display = gamejs.display.setMode([size[0], size[1]]);
  this.surface = gamejs.display.getSurface(); 
  this.camera = new Camera(this.surface);
  this.font = new gamejs.font.Font(font);

  this.sceneReader = sceneReader;
  this.sceneLoader = sceneLoader;

  // script stack, execute the "lines" of the current script
  this.instructions = [];
  this.busy = false;
}

Director.prototype.setScene = function(myScene, dirty) {
  this.scene = myScene;
  this.camera.dirty = dirty !== false ?  true : false;
}

// Simple scenes
Director.prototype.menu = function() {
  this.status = this.MENU;

  //size = this.surface.getSize();
  //this.surface.blit(this.font.render("Play"), [size[0]/2 - 70, this.size[1]/2]);
}


Director.prototype.win = function() {
}

Director.prototype.loose = function() {
}

Director.prototype.start = function(myScene) {
  this.status = this.RUNNING;
  this.setScene(myScene);
}

Director.prototype.loading = function() { 
  this.status = this.LOADING;
  var myScene, size, image, sprite, sprite2; 
  myScene = {
      sprites : {},
      spriteGroup : new gamejs.sprite.Group()
  }
  size = this.surface.getSize();
  image = this.loadImage('loading.png');
  sprite = components.create('Visible', 'Rotative');
  pos = [size[0]/2 - 40, size[1]/2 - 40];
  size = image.getSize();
  sprite.rect = new gamejs.Rect(pos, size);
  sprite.originalImage = image;

  myScene.spriteGroup.add(sprite);
  myScene.sprites['loading'] = sprite;

  //this.surface.blit(this.font.render("LoadinG ..."), [size[0]/2 - 70, size[1]/2]);
  //this.surface.blit(this.loadImage('loading.png'), [size[0]/2 - 40, size[1]/2 - 40]);

  this.setScene(myScene, true);
}


// OH YEAHHHH
Director.prototype.everyoneIsDirty =  function() {
  _.each(this.scene.sprites, function(sprite, k) {
      sprite.oldImage = false;
      sprite.dirty=true;
  }, this); 
}

Director.prototype.test = function() {
  console.log('test', this.status);
  if(this.status === "running") {
    this.pauseScene = this.scene;
    this.loading();
  } else { 
    if(this.status === "loading") {
      this.start(this.pauseScene);
      this.everyoneIsDirty();
    }
  }
}

Director.prototype.test2 = function() {
  //console.log(this.scene.sprites.Player.rect);

  if(!this.emitter) {
    $v = require('gamejs/utils/vectors');

    var player = this.scene.sprites.Player;
    this.emitter = new particles.Emitter({
      delay: 50, 
      numParticles: 100, 
      pos: player.rect.center,
      //modifierFunc: particles.Modifiers.tail(2, 0.5, 'rgb(255, 0, 0)', $v.multiply([0,0], -1))
      modifierFunc: particles.Modifiers.explosion(4, 2, "rgba(255,0,0,0.6)")
    }); 
    this.emitter.start();

    image = gamejs.transform.scale(player.image, $v.multiply(player.image.getSize(), 1));
    this.dismantle = new Dismantle(image, { pos: player.rect.topleft });
  }
};

Director.prototype.testUpdate = function() {
  var ms = 10;
  if(this.emitter && this.emitter.isRunning()) {
    this.dismantle.age += ms;
    if (this.dismantle.age >= this.dismantle.lifetime) {
       this.emitter.stop();
       this.emitter = null;
    } else { 
     this.emitter.update(ms)
     this.dismantle.update(ms); 
    } 
  }
};

Director.prototype.testDraw = function() {
  
  if(this.emitter && this.emitter.isRunning()) {
    var player = this.scene.sprites.Player;
    //this.surface.clear(player.rect);
    //this.surface.clear(new gamejs.Rect([0, 0], [700, 700]));
    //this.systems.Rendering.clear(player, this.surface)
    //this.emitter.pos = player.rect.topleft;
    this.emitter.draw(this.surface);
    this.dismantle.draw(this.surface);
  } else if(this.emitter) {
    this.emitter = false;
    //this.surface.clear(new gamejs.Rect([0, 0], [500, 500]));
  }
};

Director.prototype.loadImage = function(image) {
  return gamejs.image.load(this.prefixs.image + image);
}
/**
  * @arg string param || array params
  */
Director.prototype.loadScene = function(name, myCallback) { 

  //Loading
  this.loading();

  //console.log(this);
  this.sceneLoader.get(name);
};

Director.prototype.readScript = function(scriptName, scene) {
    scene = scene || this.scene;
    //console.log('... reading ' + scriptName);
    if(scene.scripts && scene.scripts[scriptName]) {
      this.instructions = this.sceneReader.parse(scene.scripts[scriptName]);
    }
};

Director.prototype._act = function(params) {
  console.log("call:" + params);
  func = params.shift();
  if(this[func]) {
    this[func].apply(this, params);
  } else {
    throw new SyntaxError("try to call " + func + "(), which is not accessible or does not exists");
  }
};

Director.prototype.act = function() {
  if(this.instructions.length > 0){
    this._act(this.instructions.shift());
  }
};

//TOTHINK: Manage update speed in scenes ?
Director.prototype.update = function() {

  _.each(this.scene.sprites, function(sprite, k) {
    _.each(this.systems, function(system) {

      //TOTHINK: define empty methods vs test if method exists
      // TODO: an event base application would be more proper: cf Incube_Events
      system.update(sprite, 30, this);
  
      // because of the collision in systems.movment, i can't have lazy refresh
    }, this);
  }, this);
  this.testUpdate();
  if(this.scene.sprites.Player) this.camera.follow(this.scene.sprites.Player);
  if(this.camera.dirty) this.everyoneIsDirty();
}

Director.prototype.draw = function() {

  _.each(this.scene.sprites, function(sprite, k) {
      //if(!this.dark && sprite.dirty && sprite.rect.left > 0 && sprite.rect.top > 0) this.systems.Rendering.clear(sprite, this.surface, this.camera);
  }, this); 

  this.camera.dirty = true;
  if(this.camera.dirty) this.systems.Rendering.drawBackground(this);

  _.each(this.scene.sprites, function(sprite, k) {
      sprite.dirty = true;
      if(!this.dark && sprite.rect.left > 0 && sprite.rect.top > 0) this.systems.Rendering.draw(sprite, this.surface, this.camera);
      //// TOTHINK: define empty methods vs test if method exists
      //// TODO: an event base application would be more proper: cf Incube_Events
  }, this);
  //this.testDraw();
}

//TOTHINK: Manage input in scenes ?
Director.prototype.handleInput = function(event) {
  if (event.type === gamejs.event.KEY_DOWN) {
    if(event.key == gamejs.event.K_t) {
      //this.test();
    }
  }
  if(this.status === this.RUNNING && this.scene.sprites.Player) {
    player = this.scene.sprites.Player; 
    if (event.type === gamejs.event.KEY_DOWN) {
      switch(event.key){
        case gamejs.event.K_w:  
        case gamejs.event.K_UP:  
          player.moveY = -1; break;
        case gamejs.event.K_s:  
        case gamejs.event.K_DOWN:  
          player.moveY = 1;  break;
        case gamejs.event.K_a:  
        case gamejs.event.K_LEFT:  
          player.moveX = -1; break;
        case gamejs.event.K_d:  
        case gamejs.event.K_RIGHT:  
          player.moveX = 1;  break;
      }   
      if(event.key == gamejs.event.K_e) {
        this.scene.sprites.Player.attacking = true;
      }
      if(event.key == gamejs.event.K_q) {
        //this._dialog('john do', 'message');
      }
    } else if (event.type === gamejs.event.KEY_UP) {
      switch(event.key){
        case gamejs.event.K_w:  
        case gamejs.event.K_UP:  
          if(player.moveY < 0) player.moveY = 0;break;
        case gamejs.event.K_s:  
        case gamejs.event.K_DOWN:  
          if(player.moveY > 0) player.moveY = 0;break;

        case gamejs.event.K_a: 
        case gamejs.event.K_LEFT:  
          if(player.moveX < 0) player.moveX = 0; break;
        case gamejs.event.K_d:   
        case gamejs.event.K_RIGHT:  
          if(player.moveX > 0) player.moveX = 0; break;
      }   

    } 
  }
};

Director.prototype.finish = function() {
  this.status = this.LOADING;
  console.log("Kikoo");
  var myScene, size, image, sprite, sprite2; 
  myScene = {
      sprites : {},
      bgImage: this.loadImage("finish.png"),
      spriteGroup : {}
  }

  this.setScene(myScene, false);
  this.surface.blit(myScene.bgImage, new gamejs.Rect([0,0], this.surface.getSize())); 

}



/**
 * Function below are accesible from scene scripts, 
 * TODO: for better encapsulation, put them into a new namespace, e.g: Director.prototype.scriptMethods
 */

// TODO: develop dialog system, jquery ui was the fast heavy, dirty solution
Director.prototype._dialog = function(actor, msg, buttons) {
  console.log('test', actor, msg);

  size = this.surface.getSize();
  pos = [0, size[1] - 200];
  rect = new gamejs.Rect(pos, [size[1], 200]);
  this.surface.fill('#00f', rect);
  this.surface.blit(this.font.render("LoadinG ..."), pos);
  //this.busy=true;
  /*var canvas = $("#gjs-canvas");
  var div = $("#dialog");
  var cpos = canvas.position();
  var self = this;
  
  if(this.lastActor !== actor) {
    //If new actor re-generate dialog
    //div.dialog( "destroy" );
    div.dialog({
      title: actor,
      modal: true,
      show:"Fold",
      resizable: false,
      draggable: false,
      closeOnEscape: false,
      //position:"bottom",
      buttons:buttons,
      //position: [this.sprites[actor].left + 180, this.sprites[actor].rect.top + 60 ]
      //position: [cpos.left, cpos.top + canvas.innerHeight()]
      close: function(event, ui){
      self.busy=false;
    }
  }).empty()
    .append('<img class="ui-dialog-avatar" src="/game/' + this.scene.sprites[actor].image_urn  + '"/>')
    .append('<p class="ui-dialog-text">' + msg + '</p>');

    //div.empty().append('<img class="ui-dialog-avatar" src="/game/' + this.sprites["Player"].image_urn  + '"/>').append('<p class="ui-dialog-text">' + msg + '</p>');
  } else {
    div.find(".ui-dialog-text").append("\n" + msg);
    div.dialog( "option", "buttons", buttons);
  }
  this.lastActor = actor; */
};


Director.prototype.dialog = function(actor, msg) {
  
  this._dialog(actor, msg, {});

  var self = this;
  var div = $(".ui-dialog");
  div.keydown(function(event) { 
    if(!event.isDefaultPrevented() && event.keyCode && event.keyCode === $.ui.keyCode.SPACE ) {
      self.busy = false;
      div.unbind(event);
      event.preventDefault();
    }
  });
};

Director.prototype.ask = function(label, questions) {
  var buttons = [];
  var self = this;
  $.each(questions, function(k, v) {
    buttons.push({
      text: v,
      click: function() {
        self[label] = k;
        $( this ).dialog( "close" );
      }
    });
  });
  this._dialog("Player", "", buttons); 
};

Director.prototype.set = function(key, value) { 
  this._read(this.instructions.shift());
  this.scene[key] = value;
};

Director.prototype.increase = function(key, value) { 
  if(this.scene[key]) {
    this.scene[key] += value;
  } else {
    this.scene[key] = value;
  }
};

Director.prototype.switch = function(key, values) { 
  this[key] = this[key] || 0;
  //console.log('data', values);
  var instructions = this.sceneReader.parse(values[this[key]]);
  this.instructions = instructions.concat(this.instructions);
};

Director.prototype.max = function(key, values) { 
  var lastv = 0, key2 = values[0];
  var scene = this.scene;
  $.each(values, function(k, v) {
    if(scene[v]) {
      if(scene[v]>lastv) {
        key2 = v;
        lastv = scene[v];
      }
    }
  });
  this.scene[key] = key2;
}

