(function() {
    "use strict";

    var Configurator = function (utils) {
        var handlers = [];
        
        this.addConfigHandler = function (handler) {
            if (typeof handler === 'function') {
                handlers.push(handler);
            }
            
            return this;
        };
        
        this.getConfig = function () {
            var config = {};
            
            for (var i in handlers) {
                config = utils.mergeObjects(config, handlers[i].apply(handlers[i], arguments));
            }
            
            return config;
        };
    };

    module.exports = function(utils){
        return new Configurator(utils);
    }
})();

