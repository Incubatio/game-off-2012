express = require 'express'
#app     = module.exports =  express()
app    = require('express')()
server = require('http').createServer(app)
io     = require('socket.io').listen(server)

backboneio = require('backbone.io')
backend    = backboneio.createBackend()
backend.use(backboneio.middleware.memoryStore())

backboneio.listen(io, { mybackend: backend })


#_ = require 'underscore'
#csrf = require 'csrf'
#fs = require 'fs'
#backbone   = require 'backbone'

haml = require 'hamljs'
cons = require 'consolidate'


app.configure(() ->
  app.set 'port', process.env.PORT || 3001 

  app.engine 'haml', cons.haml
  app.set 'views', __dirname + '/views'
  app.engine 'haml', cons.haml
  app.set 'view engine', 'haml'

  app.set("view options", {layout: false});
  app.use express.logger()

  app.use express.bodyParser()
  app.use express.cookieParser()
  #app.use csrf.check()
  app.use app.router
  app.use express.methodOverride()
  app.use express.static("#{__dirname}/public")
)

#var controller_path = __dirname + '/controllers';
#var controllers = fs.readdirSync(controller_path);
#function include(path) {
#  eval(fs.readFileSync(path, 'ascii'));
#}

#_.each(controllers, function(c, app) {
#    if(/\w+\.js$/.exec(c)) {
#      include(controller_path + "/" + c);
#    }
#  });

#res.render('layout', {body: 'hello world', title: 'homeworld'});

#app.get('/404', function(req, res){
#    data = "404";
#    res.send(data);
#});

#app.listen app.get 'port'
server.listen app.get 'port' 

io.sockets.on 'connection', (socket) ->
  socket.on 'get scene', (params) -> 
    require('fs').readFile __dirname + "/data/scenes/" + params.name + ".json", "utf8", (err,data) ->
      scene = JSON.parse(data)
      if(scene.map)  
        require('fs').readFile __dirname + "/data/maps/test.json", "utf8", (err,data) ->
          scene.map = JSON.parse(data)
          socket.emit 'scene', scene
      else
        socket.emit 'scene', scene
  #socket.emit 'news', hello: 'world'
  #socket.on 'my other event', (data) -> 
  #  console.log 'Hello world;'
  #  console.log data
    

#io.sockets.on 'connection', (socket) ->
#  require('./controllers')(socket)

#backboneio.set 'log level', 1


app.get '/', (req, res) -> 
  #res.sendfile __dirname + '/index.html'
  res.render('index.haml')


