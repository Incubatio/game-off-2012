$ = jQuery = window.$;
io         = window.io;
Backbone   = window.Backbone
socket = io.connect('http://localhost:3000')

inArray = (needle, haystack) ->
  for i in haystack 
    if(i == needle) 
      return true
  return false

Console =
  position: 0
  equiped: false
  light: false
  tutorial: false
  
  i: 0
  stack: []

  data: {}
  gobjects: {
    ball: {
      description: "it's actually a computer designed in a ball shape. If we look closely, we can see engraved \" Microsoft windows 95 inside \", which sound in your head like HIT ME",
      interactions: {
        doAttack: "emit reset pong"
      }
    },
    hammer: {
      description: "A small hammer that would have been manufactured by Thor, Hephaistos and Vulcain, the legend says that it helped building the sky"
      interactions: {
        doAttack: "sprint this is to small to hurt anyone",
        doEquip: "emit equip hammer"
      }
    }
    lampp: {
      description: "A classic crank frontal light"
      #interactions: {
      #  switchLight: "emit switch light"
      #}
    }
    cake: {
      description: "Eat me",
      doEat: "emit cheat pong"
    }
    key: {
      description: "Looks like to be the key of you room"
    }
    tachikoma: {
      description: "Tachikoma ka ?, a character of gost in the shell, amazing manga, don't ya think ?"
    }
    gundam: {
      description: "A small figurine of a robot. What are they usefull for when they have that size"
    }
    
  }

  inventory: []
  
  commands: {  
    openInventory: ['inventory', 'bag']
    doAttack: ['attack', 'hit', 'kill', 'play', 'kick', 'slap', 'throw', 'break', 'destroy', 'anihilate']
    doEquip: ['take', 'equip', 'grab', 'use']
    doUnlock: ['unlock', 'open']
    doLock: ['lock', 'close']
    doLook: ['look', 'watch', 'observe', 'describe', 'view', 'analyse', 'details']
    doEat: ['eat'] 
    doDrink: ['drink']
    switchLight: ['switch', 'on', 'off', 'light', 'lampp']
    doMove: ['move', 'run', 'n', 'e', 's', 'w']
    doHelp: ['help']
    doSkip: ['skip']
    doFuck: ['fuck', 'frustration']
  }

  #answers: {
  #  yes: ['y', 'ok', 'k', 'ay', 'affirmative']
  #  no: ['no', 'nope', 'negative']
  #}

  doHelp: (target) ->
    this.sprint "On the contrary to AI that should assists you, I'am your eyes and your hands in this world. You can do almost everything by using 1 or 2 words commands.
Two important basics are:\n
  - Movement -> moving is possible by indicating cardinal points by their first letter (n, s, e, w), for example if you 
want to go to the north, type n.\n
  - Inventory -> you're wearing a bag with limited space, to access your bag, type \"bag\" or \"inventory\". With the
items in your bag, you can equip/take them, look for information but also specific actions related to the item context.
You most of the time need two words to manipulate object, one for the action and the other for the object/target.
At any moment, if the text games bores you, you can at any time type \"skip\" which will brings to the next game, 
however you still will play a bit of a text game. The command will only to work to skip the first game."

  init: () ->
    this.sprint "END OF THE TUTORIAL\n\n"
    this.inventory = ['ball', 'lampp', 'cake', 'drink', 'hammer', 'tachikoma', 'gundam']
    this.sprint "Your inventory has been updated (you received new objects)"


  doSkip: (target) ->
    if(this.position < 300) 
      this.play 300
    else
      this.sprint "Sorry you can only skip the text game"

  doEat: (target) ->
    if !target
      msg = this.funcName + " <...>, what ?"
    else
      if(this.gobjects[target]['interactions']['doEat'])
        if(inArray target, this.inventory)
          msg = if this.funcName == 'eat' then "nom nom nom" else "That was refreshing"
          this.inventory.pop target
        else
          msg = "Nooope, I don't see that in your bag"
      else
        msg = "You're just silly"
    
  doFuck: (target) ->
    this.sprint 'rage ?'

  doLock: (target) ->
    this.sprint 'There is no point doing that'

  doUnlock: (target) ->
    msg = "What do you want to unlock ?"
    if(target == "door")
      if(this.tutorial)
        msg = "it's already unlocked"
        this.tutorial = true
      else
        if inArray('key', this.inventory)
          msg = target + " is now unlocked"
        else
          msg = "It's locked and you don't have any key"
    this.sprint msg   
    
  doLook: (target) ->
    if !target
      msg = "I have no more information for the current situation"
    else 
      console.log(this.inventory[target])
      if inArray(target, this.inventory)
        console.log(this.gobjects)
        if(this.gobjects[target]['description'])
          msg = this.gobjects[target]['description']
        else
          msg = "This object is undescriptible ... (but object exists)"
      else
        msg = "not sure WHAT is a " + target
    this.sprint msg
  

  openInventory: (target) ->
    #if target  msg="what do you want to do with #{target}"
    if(this.inventory.length > 0)
      msg = "you have:\n " + this.inventory.join(",\n")
    else
      msg = "you have nothing in your bag"
    this.sprint msg

  trigger: (funcName, target) ->
    if this.gobjects[target] && this.gobjects[target]['interactions'] && this.gobjects[target]['interactions'][funcName]
      this._sparse(this.gobjects[target]['interactions'][funcName]) 
    this[funcName](target)
    this.next()

  doMove: (target) ->
    move = 0
    target = this.funcName if !target
    if inArray target, ['n', 's', 'w', 'e']
      switch target
        when 'n' then move = -1
        when 's' then move = 1
        when 'w' then move = -10
        when 'e' then move = 10

      newPos = move + this.position;
      console.log('rest', newPos, newPos % 10);
      if newPos > 99 || newPos < 1 || newPos % 10 == 0
        this.sprint "You can't go any further in that direction" 
      else
        this.position += move
        if(this.data[this.position]) then this.play this.position else this.sprint 'You\'re lost in the forest'
    else 
      this.sprint 'Where do you want to go ?'

    console.log('pos:', this.position);


  switchLight: (target) ->
    if inArray 'lampp', this.inventory
      light = {on: true, off: false}

      if(this.funcName != 'on' && this.funcName != 'off')
        if(!target || (target != 'on' && target != 'off') )
          this.light = !this.light
          target = if light['on'] == this.light then 'on' else 'off'
          hasChanged = true
      if !hasChanged
        hasChanged = true
        target = this.funcName if !target
        hasChanged = false if light[target] && this.light
        hasChanged = false if !light[target] && !this.light
        this.light = light[target]

      socket.emit('switch light', this.light) if hasChanged
      msg = if hasChanged then "Lampp is now #{target}" else "Lampp is already #{target}"
    else
      msg = "Nothing to light sir !"
    this.sprint msg
    
    
  
  doAttack: (target) ->
    if target == 'ball'
      this.sprint("AAAAATATATATATATATA, you just attacked the ball with your ancient kung fu wushu. The ball has not even a scratch but it did become silencious for a sec, and after a while made a booting sound")
    else
      this.sprint("You don't stand a chance")

  doEquip: (target) ->
    if this.data[this.position]['items']
      if this.funcName == 'equip'
        msg = "I can't equip what i don't have in my inventory" 
      else
        this.inventory.push target
        this.data[this.position]['items'].pop target
        msg = "you just put " + target + " in your bag"
      this.sprint msg
    else
      if target == 'inventory' || target == 'bag'
        this.openInventory()
      else
        if this.gobjects[target] 
          if inArray(target, this.inventory)
            msg = ""
            msg += "After putting #{this.equiped} back in your bag, " if this.equiped
            msg += "you grab #{target}"
            msg += ", and you enjoyed yourself doing it!" if this.equiped == target
            this.equiped = target
          else 
            msg = "You can't take or equip what you don't possess"
        else
          msg = "What a fertile imagination !"
        this.sprint msg

  doUnEquip: () ->
    this.equiped = false
    this.split "You now have hands free, what are you going to do ?"
    
  next: () ->
    if(this.stack.length > 0) 
      args = this.stack.shift();
      this[args[0]](args[1]);
    this.toggle()

  toggle: () ->
    if this.stack.length > 0 
      $(window).focus()
      $('label.cmd').text('Press space to continue')
      $('input').attr('style', 'display:none')
      #$(document).focus()I#
    else
      $('label.cmd').text('>')
      $('input').attr('style', '')
      $('input').focus()

  _sparse: (text) ->
    args = text.split(' ');
    functionName = args.shift();
    this.stack.push [functionName, args.join(' ')]
    this.toggle()
    #self = this;
    #setTimeout( () ->
    #  self[functionName](args.join(' '));
    #  self.i--;
    #, 2000 * self.i)
    #this.i++;
    #this[functionName](args.join(' '));


  parse: (text) ->
    text = $.trim(text)
    cmd = text.toLowerCase()
    args = cmd.split(' ');
    if(args.length > 2) 
      this.sprint 'Please stick to 1- and 2-words commands'
    else 
      answers = this.data[this.position]["answers"];
      if answers
        if answers[cmd]
          if(typeof answers[cmd] == 'object')
            for syscmd in answers[cmd]
              this._sparse(syscmd);
          else
            this._sparse(answers[cmd])
          console.log('lol', this.stack.length)
          this.next()
        else
          this.sprint 'Please answer by ' + _.keys(answers).join(' or ')
      else
        for k,v of this.commands 
          if inArray(args[0], v) 
            this.funcName = args[0] 
            funcName = k 
            break
        if funcName
          if funcName == "doMove" && this.position >= 300
            this.sprint "You cannot move anymore, you got shocked, remember ?"
          else
            this.trigger(funcName, args[1])
        else
          if inArray(args[0], this.inventory) || inArray(args[0], this.data[this.position]['items'])
            this.sprint "What do you want to do with the " + args[0] + "?"
          else
            this.sprint('Unknow command "' + cmd.toUpperCase() + '".')

  print: (text) ->
    $('span.pre-wrap').append("\r\n" + text)
    $(document).scrollTop($(document).height())
  
  sprint: (text) ->
    this.print '<i class="system">' + text + '</i>'

  ai: (text) ->
    this.print "\n" + 'AI: <b class="ai">' + text + '</b>'
    

  play: (num) ->
    this.position = parseInt(num);
    if(!this.data[num]) 
      throw new Error('Not game data at index ' + this.position)
    if this.data[num]['text'] then this.sprint this.data[num]['text'] else this.ai this.data[num]['ai']
    #this.sprint(this.data[num]['text'])
    if(this.data[num]['items'])
      this.sprint 'There is a ' + this.data[num]['items'].join("\nThere is a ")
    if(this.data[num]['actions'])
      actions = this.data[num]['actions']
      if(typeof actions == 'object')
        for syscmd in actions
          this._sparse(syscmd);
      else
        this._sparse(actions)

  start: (game) ->
    console.log('lol catz', game)
    socket.emit('start game', game)

  emit: (arg) ->
    console.log('emile', arg);
    socket.emit(arg);
    


class Line extends Backbone.Model

#defaults : 
#content : "Title",
#emmiter : 0, //system
#emmiter : 1, //user

  constructor : () ->
    console.log 'new line'

    #url = "/api/gameobject/id/" + @id

    this.bind "error", (model, error) ->
      console.log error

  #validate : (attrs) ->
    #if(!attrs.title) 
    #  return new Error ('invalid title')

class LineView extends Backbone.View
  el : $('#core-template')

  initialize : () ->
    this.template = _.template($('#note-template').html());

    #_.bindAll(this, 'render');
    this.model.bind('change', this.render);

  render : () ->
    console.log('pwet');
    renderedContent = this.template(this.model.toJSON());
    $(this.el).html(renderedContent);
    return this;


class Lines extends Backbone.Collection

  model : Line

  #backend : 'mybackend'

  #url: '/api/gameobject/'

  constructor : () -> 
    console.log 'new lines collection'


class LineFormView extends Backbone.View
  el: $('#core-foot'),

  initialize : () ->
    this.template = _.template($('#line-form-template').html());

  events : { 
    'submit form': 'addLine'
  } 
#  events: {
#    'keyup :input': 'logKey'
#    ,'keypress :input': 'logKey'
#  }
  
#  logKey: (e) -> 
#    console.log(e.type, e.keyCode);

  validate: (attrs) ->
    console.log('validation stuff');

  addLine: (e) -> 
    e.preventDefault();
    content = this.$('input').val();
    console.log(content);
    #line = new Line({ emmitter: 2, content: content});
    this.$('input').val('');
    Console.print('> ' + $.trim(content));
    Console.parse(content);
    #note.set('content', this.$('.input').val());
    #console.log('parse note');
    #this.render();

  render: () ->
    #renderedContent = this.model ? this.template(this.model.toJSON()) : this.template();
    renderedContent = this.template();
    $(this.el).html(renderedContent);                                                                          
    #if(this.model) {
    #    this.$('input.id').val(this.model.get('id'));                                                          
    #    this.$('.title').val(this.model.get('title'));
    #    this.$('.content').val(this.model.get('content'));                                                     
    #}
    return this;                                                                                               
  
  setModel: (model) ->
      this.model = model;                                                                                        
  
  error: (model, error) ->
      console.log(model, error);
      return this;

  cursor: () ->
    $('input').focus()
    document.onclick = () ->
      $('input').focus();
    $(document).keydown (e) ->
      Console.next() if e.keyCode == 32



class LinesCollectionView extends Backbone.View
  el: $('#core'),

  initialize : () ->
    this.template = _.template($('#lines-collection-container').html());

    #_.bindAll(this, 'render');
    #this.collection.bind('reset',  this.render);
    #this.collection.bind('change', this.render);
    #this.collection.bind('add',    this.render);
    #this.collection.bind('remove', this.render);

  render : () ->
    renderedContent = this.template({ lines : this.collection.toJSON() });
    $(this.el).html(renderedContent);
    #$( ".draggable" ).draggable();
    return this;


class AppRouter extends Backbone.Router

  constructor : (options) -> 
    super(options)
    this.lines = new Lines();
    this.lineFormView = new LineFormView({ collection : this.lines });
    this.lineCollectionView = new LinesCollectionView({ collection : this.lines });

  routes : {
    "" : "root",
  }

  root  : () -> 
    this.lineCollectionView.render();
    this.lineFormView.render();
    this.lineFormView.cursor();
    return


$( ->
  console.log new Date()
  App = new AppRouter()
  socket.emit 'register', "game1"

  #App.gameobjects.fetch({
  #  success: function() {Backbone.history.start()}
  #});

  socket.emit 'get adventure'

  Backbone.history.start()
  Console.sprint('Initilizing ...')
  socket.on 'adventure', (data) ->
    Console.data = data;
    Console.play 0

  socket.on 'sprint', (message) ->
    Console.sprint(message)

  socket.on 'sparse', (message) ->
    Console._sparse(message)

  socket.on 'switch light', (light) ->
    Console.light = light

  socket.on 'ai', (message) ->
    Console.ai(message)

  socket.on 'open tab', (url) ->
    console.log(url)
    window.open(url, '_blank');
    window.focus();

  
  

  #require.setModuleRoot("/game")
  #require.run("main")
  return
)

