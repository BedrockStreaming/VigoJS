(function (){
    "use strict";

    module.exports = function (casper) {
        var global = (function () {
            return this;
        }).call();
        
        global.comment = function (msg) {
            casper.echo(msg, 'COMMENT');
        };
    };
})();