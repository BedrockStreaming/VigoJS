var require = patchRequire(require);

(function () {
    "use strict";

    var TestConfigurator = function (test, libPath) {

        var Configurator = require(libPath + 'Configurator')(require('utils'));

        comment('# Unit tests for Configurator');

        Configurator.addConfigHandler(function () {
            return {
                param1: 'a value',
                param2: 'a value for param2'
            }
        });

        test.assertEquals(Configurator.getConfig(), {
            param1: 'a value',
            param2: 'a value for param2'
        }, 'getConfig');

        Configurator.addConfigHandler(function () {
            return {
                param1: 'another value',
                param3: 'a value for param3'
            }
        });

        test.assertEquals(Configurator.getConfig(), {
            param1: 'another value',
            param2: 'a value for param2',
            param3: 'a value for param3'
        }, 'getConfig with 2 handlers');

        Configurator.addConfigHandler(function (handlerParam) {
            return {
                param2: handlerParam,
            }
        });

        test.assertEquals(Configurator.getConfig('a param'), {
            param1: 'another value',
            param2: 'a param',
            param3: 'a value for param3'
        }, 'getConfig with a parameter');
    };

    exports.create = function(test, libPath){
        return new TestConfigurator(test, libPath);
    };
})();
