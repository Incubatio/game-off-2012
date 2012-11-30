express = require 'express'
#app     = module.exports =  express()
app    = require('express')()
server = require('http').createServer(app)
io      = require('socket.io').listen(server)
clients = {};
light = false;

backboneio = require('backbone.io')
backend    = backboneio.createBackend()
backend.use(backboneio.middleware.memoryStore())

backboneio.listen(io, { mybackend: backend })


haml = require 'hamljs'
cons = require 'consolidate'

app.configure(() ->
  app.set 'port', process.env.PORT || 3000 

  app.engine 'haml', cons.haml
  app.set 'views', __dirname + '/views'
  app.engine 'haml', cons.haml
  app.set 'view engine', 'haml'

  app.set("view options", {layout: false});
  app.use express.logger()

  app.use express.bodyParser()
  app.use express.cookieParser()
  app.use app.router
  app.use express.methodOverride()
  app.use express.static("#{__dirname}/public")
)

server.listen app.get 'port' 


io.sockets.on 'connection', (socket) ->
  emit = () ->
    args = [];
    Array.prototype.push.apply( args, arguments );
    clientName = args.shift();
    if(clients[clientName])
      clients[clientName].emit.apply clients[clientName], args

  socket.on 'register', (name) ->
    console.log('register: ', name);
    clients[name] = socket
    socket.emit 'switch light', light

    if(name == 'game1')
      socket.on 'get adventure', () ->
        require('fs').readFile __dirname + "/data/text/adventure.json", "utf8", (err,data) ->
          emit 'game1', 'adventure', JSON.parse(data)

      socket.on 'start game', (gameName) ->
        #gameName = gameName[0]
        port = if gameName == "game2" then 3001 else 3002
        stack = [];
        sys = require('sys')
        exec = require('child_process').exec;
        puts = (error, stdout, stderr) -> 
          console.log(stdout)
          sys.puts(stdout)
          console.log('error:', error)
          console.log('stderr:', stderr)
          setTimeout () -> 
            emit('game1', 'open tab', 'http://localhost:' + port)
          , 1000

        uri = 'https://github.com/Incubatio/game-off-2012.git'
        cmd = "if [ ! -d \"#{gameName}\" ]; then git clone -b #{gameName} #{uri} #{gameName};fi;  node #{gameName}/src/server.js &> var/logs/#{gameName} < var/logs/#{gameName} &"
        #cmd = "node.exe #{gameName}/src/server.js"
        console.log(cmd);
        exec(cmd, puts)
        
      socket.on 'reset pong', () -> 
        emit 'game2', 'reset pong'

      socket.on 'equip hammer', () -> 
        emit 'game2', 'equip hammer'
  
      socket.on 'switch light', (light2) ->
        light = light2
        emit 'game2', 'switch light', light2
        emit 'game3', 'switch light', light2
        


    if(name == 'game2')
      socket.on 'loose pong', () -> 
        emit 'game1', 'ai', 'haha, looser ...'
        emit 'game1', 'sprint', '(something seem to vibrate in you bag ...)'
        
      socket.on 'win pong', () -> 
        emit 'game1', 'sparse', "play 305"

      socket.on 'win forge', () -> 
        emit 'game1', 'sparse', 'play 310'

      socket.on 'win oiram', () -> 
        emit 'game1', 'sparse', 'play 320'

    if(name == 'game3')
      socket.on 'get scene', (params) -> 
        require('fs').readFile __dirname + "/data/scenes/" + params.name + ".json", "utf8", (err,data) ->
          scene = JSON.parse(data)
          if(scene.map)  
            require('fs').readFile __dirname + "/data/maps/test.json", "utf8", (err,data) ->
              scene.map = JSON.parse(data)
              emit 'game3', 'scene', scene
          else
            emit 'game3', 'scene', scene

      socket.on 'transfer cube', () ->
        emit 'game2', 'cube'

      socket.on 'win rpg', () -> 
        emit 'game1', 'sparse', 'play 330'


app.get '/', (req, res) -> 
  res.render('index.haml')
