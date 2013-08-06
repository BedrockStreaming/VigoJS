(function() {
    "use strict";

    var Casper = function () {
        Casper._super.constructor.call(this, arguments);
    };

    Casper.prototype.init = function (buildPath, xUnitFileName) {
        var self = this;

        this.on('open', function () {
            this.clear();
        });

        this.on('waitFor.timeout', function () {
            this.clear();
        });

        this.test.on('tests.complete', function() {
            this.casper.echo('Process ended, xml result is going to be generated.');
            this.renderResults(true, 0, buildPath + '/' + xUnitFileName);
        });

        this.test.on('fail', function(failure) {
            if (this.casper.started) {
                var lastFailure = self.test.currentSuite.failures[self.test.currentSuite.failures.length - 1];
                lastFailure.message += ' [last opened url : ' + self.status().requestUrl + ']';

                self.echo('#    last opened url : ' + self.status().requestUrl, 'COMMENT');
                
                self.capture(buildPath + '/' + (failure.file ? failure.file.replace(/\W/g, '_') : 'fail') + '.png');
            }
        });

        this.setMaxListeners(100);
        this.test.setMaxListeners(100);
        this.test.currentSuiteNum = 0;
    };

    exports.create = function (libPath, casperClass, options) {
        var inheritance = require(libPath + 'Inheritance');

        inheritance.inherits(Casper, casperClass);

        return new Casper(options);
    };
})();