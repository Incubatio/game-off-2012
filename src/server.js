// Generated by CoffeeScript 1.4.0
(function() {
  var app, backboneio, backend, cons, express, haml, io, server;

  express = require('express');

  app = require('express')();

  server = require('http').createServer(app);

  io = require('socket.io').listen(server);

  backboneio = require('backbone.io');

  backend = backboneio.createBackend();

  backend.use(backboneio.middleware.memoryStore());

  backboneio.listen(io, {
    mybackend: backend
  });

  haml = require('hamljs');

  cons = require('consolidate');

  app.configure(function() {
    app.set('port', process.env.PORT || 3002);
    app.engine('haml', cons.haml);
    app.set('views', __dirname + '/views');
    app.engine('haml', cons.haml);
    app.set('view engine', 'haml');
    app.set("view options", {
      layout: false
    });
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(app.router);
    app.use(express.methodOverride());
    return app.use(express["static"]("" + __dirname + "/public"));
  });

  server.listen(app.get('port'));

  io.sockets.on('connection', function(socket) {
    return socket.on('get scene', function(params) {
      return require('fs').readFile(__dirname + "/data/scenes/" + params.name + ".json", "utf8", function(err, data) {
        var scene;
        scene = JSON.parse(data);
        if (scene.map) {
          return require('fs').readFile(__dirname + "/data/maps/test.json", "utf8", function(err, data) {
            scene.map = JSON.parse(data);
            return socket.emit('scene', scene);
          });
        } else {
          return socket.emit('scene', scene);
        }
      });
    });
  });

  app.get('/', function(req, res) {
    return res.render('index.haml');
  });

}).call(this);
