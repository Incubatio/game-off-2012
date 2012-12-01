// Generated by CoffeeScript 1.4.0
(function() {
  var $, AppRouter, Backbone, Console, Line, LineFormView, LineView, Lines, LinesCollectionView, inArray, io, jQuery, socket,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = jQuery = window.$;

  io = window.io;

  Backbone = window.Backbone;

  socket = io.connect('http://localhost:3010');

  inArray = function(needle, haystack) {
    var i, _i, _len;
    if (haystack && typeof haystack === "object") {
      for (_i = 0, _len = haystack.length; _i < _len; _i++) {
        i = haystack[_i];
        if (i === needle) {
          return true;
        }
      }
      return false;
    }
  };

  Console = {
    position: 0,
    equiped: false,
    light: false,
    tutorial: false,
    i: 0,
    stack: [],
    data: {},
    gobjects: {
      ball: {
        description: "A small computer designed as a ball shape. If we look closely, we can see engraved \" Microsoft windows 95 inside \", which sound in your head like HIT ME",
        interactions: {
          doAttack: "emit reset pong"
        }
      },
      hammer: {
        description: "A small hammer that would have been manufactured by Thor, Hephaistos and Vulcain, the legend says that it helped building the sky",
        interactions: {
          doAttack: "sprint This is to small to hurt anyone",
          doEquip: "emit equip hammer"
        }
      },
      lampp: {
        description: "A classic crank frontal light"
      },
      cake: {
        description: "Eat me",
        interactions: {
          doEat: "emit grow pong"
        }
      },
      soda: {
        description: "Dink me",
        interactions: {
          doEat: "emit shrink pong"
        }
      },
      key: {
        description: "Looks like to be the key of you room"
      },
      tachikoma: {
        description: "Tachikoma ka ?, a character of gost in the shell, amazing manga, don't ya think ?"
      },
      gundam: {
        description: "A small figurine of a robot. What are they usefull for when they have that size"
      }
    },
    inventory: [],
    commands: {
      openInventory: ['inventory', 'bag'],
      doAttack: ['attack', 'hit', 'kill', 'play', 'kick', 'slap', 'throw', 'break', 'destroy', 'anihilate'],
      doEquip: ['take', 'equip', 'grab', 'use'],
      doUnlock: ['unlock', 'open'],
      doLock: ['lock', 'close'],
      doLook: ['look', 'watch', 'observe', 'describe', 'view', 'analyse', 'details'],
      doEat: ['eat'],
      doDrink: ['drink'],
      switchLight: ['switch', 'on', 'off', 'light', 'lampp'],
      doHelp: ['help'],
      doSkip: ['skip'],
      doFuck: ['fuck', 'frustration'],
      doHint: ['hint']
    },
    doHelp: function(target) {
      return this.sprint("On the contrary to AI that assists you, I'am your eyes and your hands in this world. You can do almost everything by using 1 or 2 words commands.Two important basics are:\n  - read closely text that is sent to you \n  - look for informations \n  - gather items\n  - use or equip items\nFor example, in the tutorial, the player was in a locked geek room, there was object on a ground, including a key.The following command among other could have been use to solve the situation (unlock the door):\"take key\" \n\"look key\"\n\"unlock door\"\nYou could also used a hammer:\"take hammer\"\n\"equip hammer\"\n\"break door\"\nIf you are stuck with the current puzzle type \"hint\" and remember there are hint in several tabs");
    },
    init: function() {
      this.sprint("END OF THE TUTORIAL\n\n");
      this.inventory = ['ball', 'lampp', 'cake', 'soda', 'hammer', 'tachikoma', 'gundam'];
      return this.sprint("Your inventory has been updated (you received new objects)");
    },
    doHint: function() {
      switch (true) {
        case this.position > 303:
          return this.sprint("You need to make use of an object in your bag, that is somehow related to pong");
        case this.position > 304:
          return this.sprint("You need to be equiped before going on war, and that blue screen is death.");
        case this.position > 310:
          return this.sprint("If the moon can't catch the sun, the stairway to freedom will stay almost invisible ... oh, and collisions reset the \"magnetic jump\"");
      }
    },
    doSkip: function(target) {
      if (this.position < 302) {
        return this.play(302);
      } else {
        return this.sprint("Sorry you can only skip the tutorial");
      }
    },
    doEat: function(target) {
      var msg;
      if (!target) {
        msg = this.funcName + " <...>, what ?";
      } else {
        if (this.gobjects[target] && this.gobjects[target]['interactions']['doEat']) {
          if (inArray(target, this.inventory)) {
            msg = this.funcName === 'eat' ? "nom nom nom" : "That was refreshing";
            this.inventory.pop(target);
          } else {
            msg = "Nooope, I don't see that in your bag";
          }
        } else {
          msg = "You're just silly";
        }
      }
      return this.sprint(msg);
    },
    doFuck: function(target) {
      return this.sprint('rage ?');
    },
    doLock: function(target) {
      return this.sprint('There is no point doing that');
    },
    doUnlock: function(target) {
      var msg;
      msg = "What do you want to unlock ?";
      if (target === "door" || target === "room") {
        if (this.tutorial) {
          msg = "it's already unlocked";
          this.tutorial = true;
        } else {
          if (inArray('key', this.inventory)) {
            this.sprint(target + " is now unlocked");
            this.play(8);
            msg = '';
          } else {
            msg = "It's locked and you don't have any key";
          }
        }
      }
      return this.sprint(msg);
    },
    doLook: function(target) {
      var msg;
      if (!target) {
        msg = "I have no more information for the current situation";
      } else {
        console.log(this.inventory[target]);
        if (inArray(target, this.inventory)) {
          console.log(this.gobjects);
          if (this.gobjects[target]['description']) {
            msg = this.gobjects[target]['description'];
          } else {
            msg = "This object is undescriptible ... (but object exists)";
          }
        } else {
          msg = "not sure WHAT is a " + target;
        }
      }
      return this.sprint(msg);
    },
    openInventory: function(target) {
      var msg;
      if (this.inventory.length > 0) {
        msg = "you have:\n " + this.inventory.join(",\n");
      } else {
        msg = "you have nothing in your bag";
      }
      return this.sprint(msg);
    },
    trigger: function(funcName, target) {
      if (this.gobjects[target] && this.gobjects[target]['interactions'] && this.gobjects[target]['interactions'][funcName]) {
        this._sparse(this.gobjects[target]['interactions'][funcName]);
      }
      this[funcName](target);
      return this.next();
    },
    doMove: function(target) {
      var move, newPos;
      move = 0;
      if (!target) {
        target = this.funcName;
      }
      if (inArray(target, ['n', 's', 'w', 'e'])) {
        switch (target) {
          case 'n':
            move = -1;
            break;
          case 's':
            move = 1;
            break;
          case 'w':
            move = -10;
            break;
          case 'e':
            move = 10;
        }
        newPos = move + this.position;
        console.log('rest', newPos, newPos % 10);
        if (newPos > 99 || newPos < 1 || newPos % 10 === 0) {
          this.sprint("You can't go any further in that direction");
        } else {
          this.position += move;
          if (this.data[this.position]) {
            this.play(this.position);
          } else {
            this.sprint('You\'re lost in the forest');
          }
        }
      } else {
        this.sprint('Where do you want to go ?');
      }
      return console.log('pos:', this.position);
    },
    switchLight: function(target) {
      var hasChanged, light, msg;
      if (inArray('lampp', this.inventory)) {
        light = {
          on: true,
          off: false
        };
        if (this.funcName !== 'on' && this.funcName !== 'off') {
          if (!target || (target !== 'on' && target !== 'off')) {
            this.light = !this.light;
            target = light['on'] === this.light ? 'on' : 'off';
            hasChanged = true;
          }
        }
        if (!hasChanged) {
          hasChanged = true;
          if (!target) {
            target = this.funcName;
          }
          if (light[target] && this.light) {
            hasChanged = false;
          }
          if (!light[target] && !this.light) {
            hasChanged = false;
          }
          this.light = light[target];
        }
        if (hasChanged) {
          socket.emit('switch light', this.light);
        }
        msg = hasChanged ? "Lampp is now " + target : "Lampp is already " + target;
      } else {
        msg = "Nothing to light sir !";
      }
      return this.sprint(msg);
    },
    doAttack: function(target) {
      if (target === 'ball') {
        return this.sprint("AAAAATATATATATATATA, you just attacked the ball with your ancient kung fu wushu. The ball has not even a scratch but it did become silencious for a sec, and after a while made a booting sound");
      } else {
        return this.sprint("You don't stand a chance");
      }
    },
    doEquip: function(target) {
      var msg;
      if (this.data[this.position]['items'] && inArray(target, this.data[this.position]['items'])) {
        if (this.funcName === 'equip') {
          msg = "I can't equip what i don't have in my inventory";
        } else {
          this.inventory.push(target);
          this.data[this.position]['items'].pop(target);
          msg = "you just put " + target + " in your bag";
        }
        return this.sprint(msg);
      } else {
        if (target === 'inventory' || target === 'bag') {
          return this.openInventory();
        } else {
          if (this.gobjects[target]) {
            if (inArray(target, this.inventory)) {
              msg = "";
              if (this.equiped) {
                msg += "After putting " + this.equiped + " back in your bag, ";
              }
              msg += "you grab " + target;
              if (this.equiped === target) {
                msg += ", and you enjoyed yourself doing it!";
              }
              this.equiped = target;
            } else {
              msg = "You can't take or equip what you don't possess";
            }
          } else {
            msg = "What a fertile imagination !";
          }
          return this.sprint(msg);
        }
      }
    },
    doUnEquip: function() {
      this.equiped = false;
      return this.split("You now have hands free, what are you going to do ?");
    },
    next: function() {
      var args;
      if (this.stack.length > 0) {
        args = this.stack.shift();
        this[args[0]](args[1]);
      }
      return this.toggle();
    },
    toggle: function() {
      if (this.stack.length > 0) {
        $(window).focus();
        $('label.cmd').text('Press space to continue');
        return $('input').attr('style', 'display:none');
      } else {
        $('label.cmd').text('>');
        $('input').attr('style', '');
        return $('input').focus();
      }
    },
    _sparse: function(text) {
      var args, functionName;
      args = text.split(' ');
      functionName = args.shift();
      this.stack.push([functionName, args.join(' ')]);
      return this.toggle();
    },
    parse: function(text) {
      var answers, args, cmd, funcName, k, syscmd, v, _i, _len, _ref, _ref1;
      text = $.trim(text);
      cmd = text.toLowerCase();
      args = cmd.split(' ');
      if (args.length > 2) {
        return this.sprint('Please stick to 1- and 2-words commands');
      } else {
        answers = this.data[this.position]["answers"];
        if (answers) {
          if (answers[cmd]) {
            if (typeof answers[cmd] === 'object') {
              _ref = answers[cmd];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                syscmd = _ref[_i];
                this._sparse(syscmd);
              }
            } else {
              this._sparse(answers[cmd]);
            }
            console.log('lol', this.stack.length);
            return this.next();
          } else {
            return this.sprint('Please answer by ' + _.keys(answers).join(' or '));
          }
        } else {
          _ref1 = this.commands;
          for (k in _ref1) {
            v = _ref1[k];
            if (inArray(args[0], v)) {
              this.funcName = args[0];
              funcName = k;
              break;
            }
          }
          if (funcName) {
            if (funcName === "doMove" && this.position >= 300) {
              return this.sprint("You cannot move anymore, you got shocked, remember ?");
            } else {
              return this.trigger(funcName, args[1]);
            }
          } else {
            if (inArray(args[0], this.inventory) || inArray(args[0], this.data[this.position]['items'])) {
              return this.sprint("What do you want to do with the " + args[0] + "?");
            } else {
              return this.sprint('Unknow command "' + cmd.toUpperCase() + '".');
            }
          }
        }
      }
    },
    playSound: function() {
      var audio, ext;
      audio = new Audio();
      ext = Modernizr.audio.ogg ? 'ogg' : Modernizr.audio.mp3 ? 'mp3' : 'm4a';
      audio.src = 'sfx/appear-online.' + ext;
      return audio.play();
    },
    print: function(text) {
      this.playSound();
      $('span.pre-wrap').append("\r\n" + text);
      return $(document).scrollTop($(document).height());
    },
    sprint: function(text) {
      return this.print('<i class="system">' + text + '</i>');
    },
    ai: function(text) {
      return this.print("\n" + 'AI: <b class="ai">' + text + '</b>');
    },
    play: function(num) {
      var actions, syscmd, _i, _len, _results;
      this.position = parseInt(num);
      if (!this.data[num]) {
        throw new Error('Not game data at index ' + this.position);
      }
      if (this.data[num]['text']) {
        this.sprint(this.data[num]['text']);
      } else {
        this.ai(this.data[num]['ai']);
      }
      if (this.data[num]['items']) {
        this.sprint('There is a ' + this.data[num]['items'].join("\nThere is a "));
      }
      if (this.data[num]['actions']) {
        actions = this.data[num]['actions'];
        if (typeof actions === 'object') {
          _results = [];
          for (_i = 0, _len = actions.length; _i < _len; _i++) {
            syscmd = actions[_i];
            _results.push(this._sparse(syscmd));
          }
          return _results;
        } else {
          return this._sparse(actions);
        }
      }
    },
    start: function(game) {
      console.log('lol catz', game);
      return socket.emit('start game', game);
    },
    emit: function(arg) {
      console.log('emile', arg);
      return socket.emit(arg);
    }
  };

  Line = (function(_super) {

    __extends(Line, _super);

    function Line() {
      console.log('new line');
      this.bind("error", function(model, error) {
        return console.log(error);
      });
    }

    return Line;

  })(Backbone.Model);

  LineView = (function(_super) {

    __extends(LineView, _super);

    function LineView() {
      return LineView.__super__.constructor.apply(this, arguments);
    }

    LineView.prototype.el = $('#core-template');

    LineView.prototype.initialize = function() {
      this.template = _.template($('#note-template').html());
      return this.model.bind('change', this.render);
    };

    LineView.prototype.render = function() {
      var renderedContent;
      console.log('pwet');
      renderedContent = this.template(this.model.toJSON());
      $(this.el).html(renderedContent);
      return this;
    };

    return LineView;

  })(Backbone.View);

  Lines = (function(_super) {

    __extends(Lines, _super);

    Lines.prototype.model = Line;

    function Lines() {
      console.log('new lines collection');
    }

    return Lines;

  })(Backbone.Collection);

  LineFormView = (function(_super) {

    __extends(LineFormView, _super);

    function LineFormView() {
      return LineFormView.__super__.constructor.apply(this, arguments);
    }

    LineFormView.prototype.el = $('#core-foot');

    LineFormView.prototype.initialize = function() {
      return this.template = _.template($('#line-form-template').html());
    };

    LineFormView.prototype.events = {
      'submit form': 'addLine'
    };

    LineFormView.prototype.validate = function(attrs) {
      return console.log('validation stuff');
    };

    LineFormView.prototype.addLine = function(e) {
      var content;
      e.preventDefault();
      content = this.$('input').val();
      console.log(content);
      this.$('input').val('');
      Console.print('> ' + $.trim(content));
      return Console.parse(content);
    };

    LineFormView.prototype.render = function() {
      var renderedContent;
      renderedContent = this.template();
      $(this.el).html(renderedContent);
      return this;
    };

    LineFormView.prototype.setModel = function(model) {
      return this.model = model;
    };

    LineFormView.prototype.error = function(model, error) {
      console.log(model, error);
      return this;
    };

    LineFormView.prototype.cursor = function() {
      $('input').focus();
      document.onclick = function() {
        return $('input').focus();
      };
      return $(document).keydown(function(e) {
        if (e.keyCode === 32) {
          return Console.next();
        }
      });
    };

    return LineFormView;

  })(Backbone.View);

  LinesCollectionView = (function(_super) {

    __extends(LinesCollectionView, _super);

    function LinesCollectionView() {
      return LinesCollectionView.__super__.constructor.apply(this, arguments);
    }

    LinesCollectionView.prototype.el = $('#core');

    LinesCollectionView.prototype.initialize = function() {
      return this.template = _.template($('#lines-collection-container').html());
    };

    LinesCollectionView.prototype.render = function() {
      var renderedContent;
      renderedContent = this.template({
        lines: this.collection.toJSON()
      });
      $(this.el).html(renderedContent);
      return this;
    };

    return LinesCollectionView;

  })(Backbone.View);

  AppRouter = (function(_super) {

    __extends(AppRouter, _super);

    function AppRouter(options) {
      AppRouter.__super__.constructor.call(this, options);
      this.lines = new Lines();
      this.lineFormView = new LineFormView({
        collection: this.lines
      });
      this.lineCollectionView = new LinesCollectionView({
        collection: this.lines
      });
    }

    AppRouter.prototype.routes = {
      "": "root"
    };

    AppRouter.prototype.root = function() {
      this.lineCollectionView.render();
      this.lineFormView.render();
      this.lineFormView.cursor();
    };

    return AppRouter;

  })(Backbone.Router);

  $(function() {
    var App;
    console.log(new Date());
    App = new AppRouter();
    socket.emit('register', "game1");
    socket.emit('get adventure');
    Backbone.history.start();
    Console.sprint('Initilizing ...');
    socket.on('adventure', function(data) {
      Console.data = data;
      return Console.play(0);
    });
    socket.on('sprint', function(message) {
      return Console.sprint(message);
    });
    socket.on('sparse', function(message) {
      return Console._sparse(message);
    });
    socket.on('switch light', function(light) {
      return Console.light = light;
    });
    socket.on('ai', function(message) {
      return Console.ai(message);
    });
    socket.on('open tab', function(url) {
      console.log(url);
      window.open(url, '_blank');
      return window.focus();
    });
  });

}).call(this);
