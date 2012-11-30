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
    'Trigger',
    'Rendering'
  ]
  // TODO: re write TMX support
  //options.map = new view.Map('.' + options.prefixs.image + "example.tmx");
};

myParser = new ssml.Parser();
mySceneLoader = new director.SceneLoader(socket);


images = [
  'frameset/sword.png',
  'frameset/firefox.png',
  'frameset/octocat.png',
  'frameset/vortex.png',
  'tileset/set_rules.png',
	'loading.png',
  'stargate.png'
];

_.each(images, function(img, key, list) {
  return list[key] = options.prefixs.image + img;
});

isLoaded = gamejs.preload(images);

function initIoEvents(prefixs) {
    socket.on('switch light', function(light) {
      myDirector.dark = !light;
      if(myDirector.scene) {
        myDirector.camera.dirty = true;
        myDirector.everyoneIsDirty();
      }
    });
    
    socket.emit('register', 'game3');

    // Scene Initialisation
    socket.on('scene', function(data) {
      var myScene = {},
          mySprites = {},
          mySpriteGroup = new gamejs.sprite.Group();
      var i = 1;
      _.each(data.sprites, function(values, key) {
        sprite = new gamejs.sprite.Sprite(); //components.Base(values.Base.pos, values.Base.size);
        _.each(values, function(params, classname) {
          if(classname === "Visible" && params && params.image) {
            params.image_urn     = prefixs.image + params.image;
            params.originalImage = gamejs.image.load(params.image_urn);
            //params.originalImage = gamejs.transform.scale(params.originalImage, [48, 48]); 
            params.image = params.originalImage;
          } else if(classname === "Base") {
            params.rect = new gamejs.Rect(params.pos, params.size);
          } else if(classname === "Animated") {
            params.imageset = prefixs.image + params.imageset;
            var imageset = gamejs.image.load(params.imageset);
            var spriteSheet = new SpriteSheet();
            spriteSheet.load(imageset, values.Base.size);
            params.animation = new animation.Animation(spriteSheet, params.frameset, params.options);
          }

          sprite = components.create(sprite, classname); 
          _.each(params, function(v, k) {
            // TODO: use a set method that does the check below, and maybe apply it to variables above
            sprite.hasOwnProperty(k) ? sprite[k] = v : console.log('property ' + k + ' doesn\'t exists in ' + classname + '| current value: ' + sprite[k]);
          });
        });
          // for debug and maybe more
          sprite.name = key;

          mySprites[key] = sprite;
          mySpriteGroup.add(mySprites[key]);
        });

    myScene.sprites = mySprites;

    //TODO: manage sprite groups properly
    // For now let's keep it simple only one group
    mySpriteGroup.remove(mySprites['Player']);
    myScene.spriteGroup = mySpriteGroup;
    myScene.scripts = data.scripts;
    myScene.bgImage = data.bgImage || null;
    myScene.bgMusic = data.bgMusic || null;
    
    map = new Map(data.map);
    map.prepareScreens(myDirector);
    myDirector.map = map;
    
    myDirector.start(myScene);
   // myDirector.readScript('dream');
    return;
  });
};

function main() {
  // TODO: prepare director and preload loading.png first, display loding and then load other resources.
  myDirector = new director.Director(mySceneLoader, myParser, options);
  initIoEvents(options.prefixs);
  myDirector.loading();
  myDirector.loadScene("start");
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
