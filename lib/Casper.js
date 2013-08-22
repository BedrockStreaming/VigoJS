(function() {
    "use strict";

    var Casper = function (options) {
        Casper._super.constructor.call(this, options);
    };

    Casper.prototype.init = function (buildPath, xUnitFileName) {
        var self = this;

        this.on('open', function () {
            this.clear();
        });

        this.test.on('test.done', function () {
            this.casper.clear();
        });

        this.test.on('tests.complete', function() {
            this.casper.echo('Process ended, xml result is going to be generated.');
            this.renderResults(true, 0, buildPath + '/' + xUnitFileName);
        });

        this.test.on('fail', function(failure) {
            if (this.casper.started) {

                self.echo('#    last opened url : ' + self.status().requestUrl, 'COMMENT');
                self.echo('#    test file path : ' + failure.testFilePath, 'COMMENT');
                self.echo('#    fail at line : ' + failure.failLine, 'COMMENT');


                var lastFailure = self.test.currentSuite.failures[self.test.currentSuite.failures.length - 1];
                lastFailure.message += '\n> Last opened url : ' + self.status().requestUrl;
                lastFailure.message += '\n> Test file path : ' + failure.testFilePath;
                lastFailure.message += '\n> Fail at line : ' + failure.failLine;
                
                self.capture(buildPath + '/' + (failure.file ? failure.file.replace(/\W/g, '_') : 'fail') + '.png');
            }
        });

        this.setMaxListeners(100);
        this.test.setMaxListeners(100);
        this.test.currentSuiteNum = 0;
    };

    exports.create = function (libPath, casperClass, testerClass, options, utils) {
        var casper,
            tester = require(libPath + 'Tester'),
            inheritance = require(libPath + 'Inheritance');

        inheritance.inherits(Casper, casperClass);

        casper = new Casper(options);
        casper._test = tester.create(libPath, testerClass, casper, utils);

        return casper;
    };
})();