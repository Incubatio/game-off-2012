$ = jQuery = window.$;
io         = window.io;
Backbone   = window.Backbone

class GameObject extends Backbone.Model

#defaults : 
#title : "Title",
#content : "Bla bla bla",

  constructor : () ->
    console.log 'new game object'

    #url = "/api/gameobject/id/" + @id

    this.bind "error", (model, error) ->
    console.log error

  validate : (attrs) ->
    if(!attrs.title) 
      return new Error ('invalid title')


class GameObjects extends Backbone.Collection

  model : GameObject

  backend : 'mybackend'

  #url: '/api/gameobject/'

  constructor : () -> 
      console.log 'new Game objects collection'


class AppRouter extends Backbone.Router

  constructor : (options) -> 
    super(options)
    this.notes = new GameObjects();

  routes : {
    "" : "root",
  }

  root  : () -> 
    console.log('r00t')
    return


$( ->
  console.log new Date()
  App = new AppRouter()

  #App.gameobjects.fetch({
  #  success: function() {Backbone.history.start()}
  #});
  Backbone.history.start()

  window.socket = Backbone.io.connect('http://localhost:3000')

  #window.socket.on 'test', (data) ->
  #  console.log(data)
  require.setModuleRoot("/game")
  require.run("main")
  return
)

