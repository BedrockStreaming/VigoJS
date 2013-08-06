(function() {
    "use strict";

    var Utils = function(fs) {
        this.arrayKeys = function(arr) {
            var keys = [];

            for (var i in arr) {
                keys.push(i);
            }

            return keys;
        };

        this.arrayMaxLength = function (arr)
        {
            var lengths = this.arrayKeys(arr).map(function (el) {
                return el.length;
            });
            
            return Math.max.apply(Math, lengths);
        };

        this.pad = function (n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : n + new Array(width - n.length + 1).join(z);
        };

        this.absolutize = function (path, cmdDir) {
            if (!fs.isAbsolute(path)) {
                path = fs.absolute(cmdDir + '/' + path);
            }
            
            return path;
        };
    };

    module.exports = function (fs) {
        fs = fs || require('fs');
        
        return new Utils(fs);
    }
})();