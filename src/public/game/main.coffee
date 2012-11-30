# Load Dependencies
gamejs  = require 'lib/gamejs'
draw    = require 'lib/gamejs/draw'
font    = require 'lib/gamejs/font'

#var mask = require('gamejs/mask');
#var $v = require('gamejs/utils/vectors');
gobjects  = require 'lib/utils/gobjects'
director  = require 'lib/utils/director'
ssml      = require 'lib/utils/ssml'
animation = require 'lib/utils/animation'

socket  = window.socket;

# Config
options = {
  prefixs : {
    image:   '/game/img/',
    library: '/game/lib/',
    sound:   '/game/sfx/'
  },
  screen: {
    size:  [1000, 590]
  }
};

# Resources
myParser      = new ssml.Parser()
mySceneLoader = new director.SceneLoader(socket)
myDirector    = new director.Director(mySceneLoader, myParser, options)

# Preload Images/Sounds
images = [
  'frameset/BigGuy.png', 
  'frameset/Girl.png', 
  'frameset/Hero.png', 
  'frameset/SmallGuy.png', 
  'Question.png', 
  'forest.png', 
  'town.png', 
  'loading.png', 
  'spear.png', 
  'unit.png'
];

_.each images, (img, key, list) -> 
  return list[key] = options.prefixs.image + img

gamejs.preload(images)


'''
Functions
'''
initIoEvents() ->

  socket.on 'scene', (data) ->
    # Load sprites
    i = 1;
    _.each data.sprites, (v, k) ->
      console.log(i++);
      options = v.options || {};
      if v.anim
        v.anim.image = '/game/img/' + v.anim.image;
        spriteSheet = new animation.SpriteSheet(v.anim.image, v.size);
        anim = new animation.Animation(spriteSheet, v.anim.frameset);
        mySprites[k] = new gobjects[v.class](v.pos, v.size, anim, options);
      else
        options.image = '/game/img/' + options.image;
        mySprites[k] = new gobjects[v.class](v.pos, v.size, options);

      mySpriteGroup.add(mySprites[k]);

    # Load Trigger
    #_.each(data.trigger)

    # "Actors" & "Decors", "Scenario" 
    myScene.sprites     = mySprites
    myScene.spriteGroup = mySpriteGroup
    myScene.scripts     = data.scripts

    #mainSurface.blit(this.loadImage(data.font));
    myScene.bgImage = data.bgImage || null
    myScene.bgMusic = data.bgMusic || null

    # Feed Director
    myDirector.setScene(myScene)


main() ->
  initIoEvents()

  #myDirector.loadScene("start", function(scene) {
  #    myDirector.readScript('dream', scene);
  #}); 
  myDirector.loading()

  tick() -> 
    if myDirector.busy
      return

    # Event handling
    if myDirector.handleInput
      gamejs.event.get().forEach (event) ->
        myDirector.handleInput(event)
    else
       # throw all events away
       gamejs.event.get()

    # act the next line of the script
    myDirector.act()

    # Update and draw
    myDirector.update()
    myDirector.draw()
    return

   gamejs.time.fpsCallback(tick, this, 30)
       
   # collisions
   #hasCollision = gamejs.sprite.collideMask(p1, p2)
   #if (hasCollision) {
   #   display.blit(font.render('COLLISION', '#ff0000'), [250, 50])
   #}

   #d = new Date()
   #display.blit(font.render(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() ), [5, 5])

gamejs.ready(main)
