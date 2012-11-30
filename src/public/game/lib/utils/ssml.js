/** @author Incubatio
  *
  * Simple Script Multicolumn Layout (SSML)
  **/
var Parser = exports.Parser = function() {
}

Parser.prototype.types = [
  ['separator', /^\n( *)|^,( *)/],
  ['space', /^ +/],
  ['int', /^(\d+)/],
  ['string', /^(\w+)/],
  ['string', /^"([^"]*)"/],
  ['string', /^'([^']*)'/],
  ['array', /^\[[^\]]*\]/],
  ['object', /^{[^}]*}/],
]

Parser.prototype.parse = function(str) {
  var stack = [], line = [];
  while (lastLength = str.length) {
    for (var i = 0, len = this.types.length; i < len; i++) {
      if (captures = this.types[i][1].exec(str)) {
        str = str.replace(this.types[i][1], '');
        switch(this.types[i][0]) {
          case "string":
           line.push(captures[1]); 
           break;
          case "array":
          case "object":
            //TODO change that dirty and not safe eval parse
            eval("var obj =" + captures[0]);
            line.push(obj);
            break;
          case "int":
            line.push(parseInt(captures[1]));
           break;
          case "separator":
            //console.log(line);
            stack.push(line);
            line = [];
        } 
        break;
      }
    }
    if(lastLength === str.length){
      throw new SyntaxError('The parser failed to parse: "' + str.slice(0,100) + ' ..."' ); 
    }
  }
  return stack;
};
