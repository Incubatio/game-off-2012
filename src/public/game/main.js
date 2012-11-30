// Generated by CoffeeScript 1.4.0
var animation, director, draw, font, gamejs, components, images, myDirector, myParser, mySceneLoader, options, socket, ssml;

gamejs = require('gamejs');

ssml      = require('lib/utils/ssml');
animation = require('lib/utils/animation');
SpriteSheet = require('lib/utils/spritesheet').SpriteSheet;
Map       = require('lib/tmx').Map;
director  = require('lib/utils/director');

components = require('lib/components');
//systems    = require('lib/systems');


socket = window.socket;
//Backbone = window.Backbone;

options = {
  prefixs: {
    image: 'game/img/',
    library: '/game/lib/',
    sound: '/game/sfx/'
  },
  screen: {
    size: [1000, 590]
  },
  systems: [
    'Weapon',
    'Movement',
    'Rotation',
    'Rendering'
  ]
  // TODO: re write TMX support
  //options.map = new view.Map('.' + options.prefixs.image + "example.tmx");
};

myParser = new ssml.Parser();
mySceneLoader = new director.SceneLoader(socket);


images = [
  'loading.png',
  'bsod.png', 
  'frameset/hammer.png' 
];

_.each(images, function(img, key, list) {
  return list[key] = options.prefixs.image + img;
});

isLoaded = gamejs.preload(images);

function initIoEvents(prefixs) {
  socket.on('switch light', function(light) {
      console.log(light);
      myDirector.dark = !light;
    if(myDirector.scene) {
      myDirector.scene.dirty = true;
      myDirector.everyoneIsDirty();
    }
  });
  socket.emit('register', 'game2');
};

function main() {
  // TODO: prepare director and preload loading.png first, display loding and then load other resources.
  myDirector = new director.Director(mySceneLoader, myParser, options);
  myDirector.dark = true;
  initIoEvents(options.prefixs);
  myDirector.pong();
  //myDirector.winPong();
  //myDirector.forge();
  //myDirector.loadScene("start");
  //myDirector.oiram();
  function tick() {
    if (myDirector.busy) {
      return;
    }
    if (myDirector.handleInput) {
      gamejs.event.get().forEach(function(event) {
        return myDirector.handleInput(event);
      });
    } else {
      gamejs.event.get();
    }

    myDirector.act();
    myDirector.update();
    myDirector.draw();
  };
  return gamejs.time.fpsCallback(tick, this, 50);
};

gamejs.ready(main);
