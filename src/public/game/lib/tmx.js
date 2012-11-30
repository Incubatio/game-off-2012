var gamejs = require('gamejs'),
    SpriteSheet = require('lib/utils/spritesheet').SpriteSheet;

var Map = exports.Map = function(data, options) {
  options = options || {};
  this.width = data.width;
  this.height = data.height;
  this.tileWidth = data.tilewidth
  this.tileHeight = data.tileheight
  this.size = [this.width * this.tileWidth, this.height * this.tileHeight];
  
  this.collisionLayerName = options.collisionLayerName || 'collision';


  this.spriteSheet = new SpriteSheet();
  this.visibleLayers = {};
  //this.collisions = data.collisions;
  //this.mobAreas = data.roamingAreas;
  //this.chestAreas = data.chestAreas;
  //this.staticChests = data.staticChests;
  //this.staticEntities = data.staticEntities;

  // zone groups
  //this.zoneWidth = 28;
  //this.zoneHeight = 12;
  //this.groupWidth = Math.floor(this.width / this.zoneWidth);
  //this.groupHeight = Math.floor(this.height / this.zoneHeight);

  //this.initConnectedGroups(data.doors);
  //this.initCheckpoints(data.checkpoints);
  var i;

  // by default tmx count image from 1
  this.spriteSheet.firstgid = data.tilesets[0].firstgid;
  
  // Init tileset in the main spriteSheet
  for(i = 0; i < data.tilesets.length; i++) {
    var tileset = data.tilesets[i],
        imageset = gamejs.image.load(tileset.image);
    this.spriteSheet.load(imageset, [tileset.tilewidth, tileset.tileheight]);
  }

  // Init layers, names have to be unique
  for(i = 0; i < data.layers.length; i++) {
    var layer = data.layers[i];
    // if layer.properties.visible
    this.visibleLayers[layer.name] = layer.data;
  }
  
  this.gid2pos = function(gid) {
    var x, y;
    gid -= 1;
    var getX = function(i, width) {
      return (i % width == 0) ? width - 1 : (num % width) - 1;
    }

    x = (gid == 0) ? getX(gid + 1, this.width) : 0;
    y = Math.floor(gid / this.width);

    return [x * this.tileWidth, y.tileHeight];
  }

  this.gid2rect = function(gid) {
    return new gamejs.Rect(this.gid2pos(gid), [this.tileWidth, this.tileHeight]);
  }

  this.pos2gid = function(x, y) {
    x = Math.floor(x / this.tileWidth);
    y = Math.floor(y / this.tileHeight);
    return (y * this.width) + x; //+ 1;
  }


  this.isOutOfBounds = function(x, y) {
    return x <= 10 || x >= this.size[0] || y <= 20 || y >= this.size[1];
  }

  this.isColliding = function(rect) {
    return  this._isColliding(rect.left, rect.top)
      || this._isColliding(rect.left + rect.width, rect.top)
      || this._isColliding(rect.left, rect.top + rect.height)
      || this._isColliding(rect.left + rect.width, rect.top + rect.height);
  }

  this._isColliding = function(x, y) {
    if(this.isOutOfBounds(x, y)) {
        return true;
    }
    //console.log(this.collisionLayerName, x, y, this.pos2gid(x, y), this.visibleLayers[this.collisionLayerName][this.pos2gid(x, y)]);
    //console.log(!!this.visibleLayers[this.collisionLayerName][this.pos2gid(x, y)]);
    return !!this.visibleLayers[this.collisionLayerName][this.pos2gid(x, y)];
  }

  this.getTile = function(gid) {
    return this.spriteSheet.get(gid - this.spriteSheet.firstgid);
  }

  this.prepareScreens = function(d) {
    var visibleLayer, x, y, rect, gid, surface;
    
    // TOTHINK: managing layer by layer level would more dynamics and less trivial than using names.
    // TODO: store int array of layer key in visibleLayers
    for(key in this.visibleLayers) { 
      visibleLayer = this.visibleLayers[key]; 
      surface = new gamejs.Surface(this.size[0], this.size[1]);
      //this.surface.setAlpha(layer.opacity);

      // extract images from a frameset
      for (y = 0; y < this.height; y++) {
        for (x = 0; x < this.width; x++) {
          rect = new gamejs.Rect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
          gid = visibleLayer[(y * this.width) + x]; // + 1];
          if(gid !== 0) {
            if(gid) {
              image = this.getTile(gid);
              surface.blit(image, rect);
            } else {
              console.log('bug', x, y, gid);
            }
          }
        }
      }
      this.visibleLayers[key].image = surface;
    }
  }
}
