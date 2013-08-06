var require = patchRequire(require);

(function () {
    "use strict";

    var TestCasper = function (test, libPath) {
        
        var testedCasper,
            consoleDisplay = '',
            genuineCasper  = require('casper').Casper,
            inheritance    = require(libPath + 'Inheritance'),
            MockCasper     = function () {
                MockCasper._super.constructor.call(this, arguments);
            };

        comment('# Unit tests for Casper, inherited class of casperJS');

        MockCasper.prototype.echo = function (message) {
            consoleDisplay += ' ' + message;
        }

        inheritance.inherits(MockCasper, genuineCasper);

        testedCasper = require(libPath + 'Casper').create(libPath, MockCasper, {});

        testedCasper.init('../build');
        testedCasper.test.currentTestFile = '';
        testedCasper.start();
        testedCasper.open('http://www.google.com');
        testedCasper.test.fail('This is a test', {
            doThrow: false
        });

        test.assertMatch(
            consoleDisplay,
            /FAIL.*This is a test.*last opened url : http:\/\/www.google.com\//,
            'Url of failed test is displayed in console'
        );
        test.assertMatch(
            testedCasper.test.currentSuite.failures[testedCasper.test.currentSuite.failures.length - 1].message,
            /This is a test \[last opened url : http:\/\/www.google.com\/\]/,
            'Url of failed test will be written in xUnit output'
        );
    };

    exports.create = function(test, libPath) {
        return new TestCasper(test, libPath);
    };
})();
