var require = patchRequire(require);

(function () {
    "use strict";

    var TestCasper = function (test, libPath, fs) {
        
        var testedCasper,
            consoleDisplay = '',
            utils          = require('utils'),
            genuineCasper  = require('casper').Casper,
            genuineTester  = require('tester').Tester,
            inheritance    = require(libPath + 'Inheritance'),
            MockCasper     = function () {
                MockCasper._super.constructor.call(this, arguments);
            };

        comment('# Unit tests for Casper, inherited class of casperJS');

        MockCasper.prototype.echo = function (message) {
            consoleDisplay += ' ' + message;
        }

        inheritance.inherits(MockCasper, genuineCasper);

        testedCasper = require(libPath + 'Casper').create(libPath, MockCasper, genuineTester, {}, utils);

        testedCasper.init('../build');
        testedCasper.test.currentTestFile = '';
        testedCasper.start();
        testedCasper.open('http://www.google.com');
        testedCasper.test.currentTestFilePath = fs.absolute(libPath + '../tests/testCasper.js');
        testedCasper.test.fail('This is a test', {doThrow: false});

        var consoleRegExp = new RegExp('FAIL.*This is a test.*last opened url : http:\/\/www.google.com\/.*test file path : ' + testedCasper.test.currentTestFilePath + '.*fail at line : 33');
        var xUnitRegExp = new RegExp('This is a test\n> Last opened url : http:\/\/www.google.com\/\n> Test file path : ' + testedCasper.test.currentTestFilePath + '\n> Fail at line : 33');

        test.assertMatch(
            consoleDisplay,
            consoleRegExp,
            'Url of failed test is displayed in console'
        );
        test.assertMatch(
            testedCasper.test.currentSuite.failures[testedCasper.test.currentSuite.failures.length - 1].message,
            xUnitRegExp,
            'Url of failed test will be written in xUnit output'
        );
    };

    exports.create = function(test, libPath, fs) {
        return new TestCasper(test, libPath, fs);
    };
})();
