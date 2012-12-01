// Generated by CoffeeScript 1.4.0
(function() {
  var $, AppRouter, Backbone, GameObject, GameObjects, io, jQuery,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = jQuery = window.$;

  io = window.io;

  Backbone = window.Backbone;

  GameObject = (function(_super) {

    __extends(GameObject, _super);

    function GameObject() {
      console.log('new game object');
      this.bind("error", function(model, error) {});
      console.log(error);
    }

    GameObject.prototype.validate = function(attrs) {
      if (!attrs.title) {
        return new Error('invalid title');
      }
    };

    return GameObject;

  })(Backbone.Model);

  GameObjects = (function(_super) {

    __extends(GameObjects, _super);

    GameObjects.prototype.model = GameObject;

    GameObjects.prototype.backend = 'mybackend';

    function GameObjects() {
      console.log('new Game objects collection');
    }

    return GameObjects;

  })(Backbone.Collection);

  AppRouter = (function(_super) {

    __extends(AppRouter, _super);

    function AppRouter(options) {
      AppRouter.__super__.constructor.call(this, options);
      this.notes = new GameObjects();
    }

    AppRouter.prototype.routes = {
      "": "root"
    };

    AppRouter.prototype.root = function() {
      console.log('r00t');
    };

    return AppRouter;

  })(Backbone.Router);

  $(function() {
    var App;
    console.log(new Date());
    App = new AppRouter();
    Backbone.history.start();
    window.socket = io.connect('http://localhost:3010');
    require.setModuleRoot("/game");
    require.run("main");
  });

}).call(this);
