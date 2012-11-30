var gamejs = require("gamejs");

var SpriteSheet = exports.SpriteSheet = function() {
  
  this.images = [];
  //sheet is an instance of gamejs.image
  this.get = function(id) {
     return this.images[id];
  };

  // sheet is an imageset, size is the size of each image in the set
  this.load = function(sheet, size) {
    var  width = size[0],
         height = size[1],
         imgSize = new gamejs.Rect([0,0], size);

    // do not tolerate partial image
    numX = Math.floor(sheet.rect.width / width);
    numY = Math.floor(sheet.rect.height / height);

    // extract images from a frameset
    for (var y = 0; y < numY; y++) {
      for (var x = 0; x < numX; x++) {
        var surface = new gamejs.Surface(size);
        var rect = new gamejs.Rect((x*width), (y*height), width, height);
        surface.blit(sheet, imgSize, rect);
        this.images.push(surface);
      }
    }
  }
};
