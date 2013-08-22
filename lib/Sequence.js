(function() {
    "use strict";

    var Sequence = function (fs) {

        this.list = [];
        
        this.add = function (path, match) {
            if (fs.isFile(path) && path.match(/\.js$/i) && (typeof match === 'undefined' || path.match(match))) {
                var pathSplit = path.split('/'),
                    file      = pathSplit.pop().replace('.js', ''),
                    filepath  = pathSplit.join('/');
                
                if (filepath.charAt(filepath.length - 1) !== '/') {
                    filepath += '/';
                }

                this.list.push({
                    name:     (filepath + file).replace(path.replace(/\/[^\/]+\.js$/, '') + '/', ''),
                    module:   filepath + file,
                    dir:      filepath,
                    filepath: path
                });
            } else if (fs.isDirectory(path)) {
                var self = this;

                fs.list(path).forEach(function (file, index) {
                    if (['.', '..'].indexOf(file) < 0) {
                        self.add(path.replace(/\/$/, '') + '/' + file, match);
                    }
                });
            }

            return this;
        }
    }

    module.exports = function (fs) {
        fs = fs || require('fs');
        
        return new Sequence(fs);
    };
})();