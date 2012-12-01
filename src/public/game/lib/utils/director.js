var gamejs      = require('gamejs'),
    animation   = require('lib/utils/animation'),
    components  = require('lib/components'),
    systems     = require('lib/systems');
    particles   = require('lib/particles');
    Dismantle   = require('lib/effects').Dismantle,
    SpriteSheet = require('lib/utils/spritesheet').SpriteSheet;

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

//TOTHINK: Manage screen size in scenes ?
var Director = exports.Director = function(sceneLoader, sceneReader, options) { 

  this.MENU    = 1;
  this.LOADING = 2;
  this.RUNNING = 3;
  this.PAUSE   = 4;
  this.CONSOLE = 5;

  this.options = options  = options || {};
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
  this.font = new gamejs.font.Font(font);

  this.sceneReader = sceneReader;
  this.sceneLoader = sceneLoader;

  // script stack, execute the "lines" of the current script
  this.instructions = [];
  this.busy = false;
}

Director.prototype.setScene = function(myScene, dirty) {
  this.scene = myScene;
  this.scene.dirty = dirty !== false ?  true : false;
}

// Simple scenes
Director.prototype.menu = function() {
  this.status = this.MENU;

  //size = this.surface.getSize();
  //this.surface.blit(this.font.render("Play"), [size[0]/2 - 70, this.size[1]/2]);
}

/** FORGE **/
Director.prototype.forge = function() {
  this.status = this.RUNNING;
  var hammer = components.create('Animated', 'Mobile');
  var imageset = gamejs.image.load(this.prefixs.image + 'frameset/hammer.png');
  var spriteSheet = new SpriteSheet();
  var size = [75, 120];
  spriteSheet.load(imageset, size);
  hammer.animation = new animation.Animation(spriteSheet, { "hit": [4, 0], "back": [0, 4, false]});
  hammer.rect = new gamejs.Rect([0,0], size);
  hammer.name = 'hammer'; 
  hammer.animation.currentAnimation = 'back';
  hammer.image = spriteSheet.get(4);

  var myScene = {
      name: 'hammer',
      sprites : {hammer: hammer},
      spriteGroup : new gamejs.sprite.Group(),
      bgImage: gamejs.image.load(this.prefixs.image + 'bsod.png'),
      dirty : true
  }
  myScene.spriteGroup.add([hammer]);
  this.setScene(myScene);
}

Director.prototype.winForge = function() {
  this.sceneLoader.socket.emit('win forge');
  this.oiram();
}


/** PONG  **/
Director.prototype.loosePong = function() { 
  this.sceneLoader.socket.emit('loose pong');
  this.pong();
}

Director.prototype.winPong = function() { 
  this.sceneLoader.socket.emit('win pong');
  var myScene = {
      name: 'pong',
      sprites : {},
      spriteGroup : new gamejs.sprite.Group(),
      bgImage: gamejs.image.load(this.prefixs.image + 'bsod.png'),
  }
  //this.surface.blit(gamejs.image.load(this.prefixs.image + 'bsod.png'), new gamejs.Rect([0, 0], this.surface.getSize()));
  this.setScene(myScene);
  //this.loading();
  
  //TODO: Could be nice to prepare a whole forge and require from the player to realize the actual process of forging to break the BSOD
  var self = this;
  this.sceneLoader.socket.on('equip hammer', function() {
    self.forge();
  });
}


Director.prototype.pong = function() {
  this.status = this.RUNNING;
  var myScene, size, image, puck, cpu, ball;
  myScene = {
      name: 'pong',
      sprites : {},
      spriteGroup : new gamejs.sprite.Group()
  }
  size = this.surface.getSize();

  image = this.loadImage('loading.png');

  // Sprites
  ball   = components.create('Visible', 'Mobile');
  puck   = components.create('Visible', 'Mobile');
  cpu    = components.create('Visible', 'Mobile');

  ball.circle = { color: '#fff', radius: 5}

  //TODO: press space to start the game
  ball.rect = new gamejs.Rect([size[0]/2, size[1]/2], [10, 10]);
  ball.name = 'ball', ball.speed = 4, ball.moveX = 1, ball.moveY = 1, ball.color = '#fff';

  puck.rect = new gamejs.Rect([40, size[1]/2], [3, 50]);
  puck.color = '#fff', puck.name = 'puck', puck.speed = 10;

  cpu.rect = new gamejs.Rect([size[0] - 40, 5], [3, size[1] - 10]);
  cpu.color = '#fff', cpu.name = 'cpu', cpu.speed = 10;

  myScene.sprites = { puck: puck, ball: ball, cpu: cpu};
  myScene.spriteGroup.add([ball, puck, cpu]);
  
  this.setScene(myScene);

  // reset game to remove cheat or break Adventure game's ball (both ^^)
  this.sceneLoader.socket.on('reset pong', function() {
    myScene.sprites.cpu.rect = new gamejs.Rect([size[0] - 40, size[1]/2], [3, 50]);
  });
}



/** OIRAM **/
Director.prototype.oiram = function() {
  this.status = this.RUNNING;
  var myScene, size, image, puck, door, ball;
  size = this.surface.getSize();
  player = components.create('Visible', 'Mobile', 'Jumpable');
  player.rect = new gamejs.Rect([30, size[1] - 50], [30, 30]);
  player.circle = { color: '#fff', radius: 15}
  player.color = '#fff';
  player.name = 'player';
  player.speed = 10;

  door = components.create('Visible');
  door.rect = new gamejs.Rect([40, 90], [50, 90]);
  door.color = '#fff';
  door.name = 'door';
  
  myScene = {
      name: 'oiram',
      sprites : {player: player, door: door},
      spriteGroup : new gamejs.sprite.Group(),
      queue: 0
  }
  myScene.spriteGroup.add([player, door]);

  self = this;
  this.sceneLoader.socket.on('cube', function() {
    self.createCube();
  });
  
  this.setScene(myScene);
}

Director.prototype.createCube = function() {
  if(!this.scene.counter || this.scene.sprites["cube" + this.scene.counter].rect.top > 100) {
    var cube = components.create('Visible', 'Mobile');
    cube.rect = new gamejs.Rect([100, 30], [30, 30]);
    cube.color = '#FFFFFE';
    cube.moveY = 1;
    cube.speed = 4;
    if(!this.scene.counter) this.scene.counter = 0;
    this.scene.sprites["cube" + (++this.scene.counter)] = cube;
    this.scene.spriteGroup.add([cube]);
  } else this.scene.queue++;
};

Director.prototype.unqueue = function() {
  if(this.scene.queue > 0 ) {
    this.createCube();
    this.scene.queue--;
  }
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
  console.log('test');
  this.createCube();
  //if(this.status === "running") {
    //this.pauseScene = this.scene;
    //this.loading();
  //} else { 
    //if(this.status === "loading") {
      //this.start(this.pauseScene);
      //_.each(this.scene.sprites, function(sprite, k) {
          //sprite.dirty=true;
      //}, this); 
    //}
  //}
}

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
      system.update(sprite, 30, this);
    }, this);
      sprite.dirty = true;
  }, this);
  if(this.scene.sprites.hammer) this.testUpdate();
  if(this.scene.sprites.player) this.unqueue();
}

Director.prototype.draw = function() {
  if(this.scene.dirty) this.systems.Rendering.drawBackground(this);
  _.each(this.scene.sprites, function(sprite, k) {
      if(sprite.rect.top > 0) this.systems.Rendering.clear(sprite, this.surface);
  }, this); 

  _.each(this.scene.sprites, function(sprite, k) {
      if(sprite.rect.top > 0) this.systems.Rendering.draw(sprite, this);
  }, this);
}

//TOTHINK: Manage input in scenes ?
Director.prototype.handleInput = function(event) {
  //if(event.key === gamejs.event.K_t) this.test();

  if(this.status === this.RUNNING && this.scene.sprites.puck) {
    player = this.scene.sprites.puck; 
    if (event.type === gamejs.event.KEY_DOWN) {
      switch(event.key){
        case gamejs.event.K_w:  
        case gamejs.event.K_UP:  
          player.moveY = -1; break;
        case gamejs.event.K_DOWN: 
        case gamejs.event.K_s:  
          player.moveY = 1;  break;
      }   
    } else if (event.type === gamejs.event.KEY_UP) {
      switch(event.key){
        case gamejs.event.K_w:  
        case gamejs.event.K_UP:  
          if(player.moveY < 0) player.moveY = 0;break;
        case gamejs.event.K_s:  
        case gamejs.event.K_DOWN:  
          if(player.moveY > 0) player.moveY = 0;break;
      }   
    } 
  }
  if(this.status === this.RUNNING && this.scene.sprites.player) {
    player = this.scene.sprites.player; 
    if (event.type === gamejs.event.KEY_DOWN) {
      switch(event.key){
        case gamejs.event.K_SPACE: if(player.jumpDistance === 0) player.isJumping = true; break;
        case gamejs.event.K_a:  
        case gamejs.event.K_LEFT:  
          player.moveX = -1; break;
        case gamejs.event.K_d:  
        case gamejs.event.K_RIGHT: 
          player.moveX = 1;  break;
      }   
    } else if (event.type === gamejs.event.KEY_UP) {
      switch(event.key){
        case gamejs.event.K_a: 
        case gamejs.event.K_LEFT: 
          if(player.moveX < 0) player.moveX = 0; break;
        case gamejs.event.K_d:   
        case gamejs.event.K_RIGHT:   
          if(player.moveX > 0) player.moveX = 0; break;
      }   
    } 
  }
  if(this.status === this.RUNNING && this.scene.sprites.hammer) {
    player = this.scene.sprites.hammer; 
    if (event.type === gamejs.event.MOUSE_MOTION) {
      if (this.surface.rect.collidePoint([event.pos[0]-20,event.pos[1]-120] )) {
         player.dirty = true;
         player.rect.left = event.pos[0] - 20; 
         player.rect.top = event.pos[1] - player.rect.height - 20; 
      }
    } else if (event.type === gamejs.event.MOUSE_DOWN) {
      if(player.animation.finished && !player.busy) {
        player.animation.start("hit");
        player.busy = true;
        //this.surface.clear();
        //this.scene.bgImage = this.dismantle.update(100);
        //this.scene.dirty = true;
      } 
    }
  }
};

Director.prototype.testUpdate = function() {
  if(this.dismantle) {
    var ms = 10; 
    this.dismantle.age += ms; 
    if (this.dismantle.age >= this.dismantle.lifetime) {
      this.dismantle = false;
      this.dismantle.age = 0;
      this.winForge();
    } else { 
      this.surface.clear();
      // TODO: instead of moving hammer, clear its backbaground, then make it dissapear
      this.scene.sprites.hammer.rect.moveIp([100, 100]);
      this.scene.bgImage = this.dismantle.update(100);
      this.scene.dirty = true;
    }   
  } else {
    if(this.scene.sprites.hammer && this.scene.sprites.hammer.animation.currentFrame === 0 && this.scene.sprites.hammer.animation.currentAnimation === 'back') {
      var image = this.scene.bgImage;
      this.dismantle = new Dismantle(image, { pos: [0, 0], minSize: 50, maxSize:200, lifetime:3000, direction: [0, -1], reductionRate: 2 });
    }

  }
};

