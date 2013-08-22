(function () {
    "use strict";

    var TestCheckerToolkit = function (test, libPath) {

        var Checker = require(libPath + '/checker/CheckerToolkit')(libPath);
        comment('# Unit tests for CheckerToolkit');

        // Mocks

        var anUrl        = 'http://www.m6.fr/',
            urlsCalled   = [],
            urlsToCall   = ['http://www.m6.fr/', 'http://www.w9.fr/', 'http://www.teva.fr/'],
            testResult   = '',
            errors       = [],
            fakeFunction = function () {return true;};

        var MockCasper = function() {};
        MockCasper.prototype.echo = function() {};
        MockCasper.prototype.once = function() {};
        MockCasper.prototype.evaluate = function() {};
        MockCasper.prototype.status = function() {
            return {currentHTTPStatus: undefined};
        };
        MockCasper.prototype.thenOpen = function(url) {
            urlsCalled.push(url);
        };

        var MockTestSuiteResult = function() {};
        MockTestSuiteResult.prototype.getAllFailures = function(mess) {
            if (errors.length < 2) {
                errors.push('an error');
            }

            return errors;
        };

        var MockCasperTest = function() {
            this.suiteResults = new MockTestSuiteResult();
        };
        MockCasperTest.prototype.fail = function(mess) {
            testResult = 'FAIL ' + mess;
        };
        MockCasperTest.prototype.pass = function(mess) {
            testResult = 'PASS ' + mess;
        };
        MockCasperTest.prototype.info = function(mess) {
            testResult += mess + ' | ';
        };

        var cMock = new MockCasper(),
            checker = new Checker(cMock, {});

        // Inheritance from checkerabstract

        test.assertEqual(checker.getUrl(), undefined, 'getUrl before setting url');
        checker.setUrl(anUrl);
        test.assertEqual(checker.getUrl(), anUrl, 'getUrl after setting url');

        test.assertEqual(checker.test, undefined, 'Tester before setting test');
        checker.setTest('a tester');
        test.assertEqual(checker.test, 'a tester', 'Tester test after setting test');

        test.assertEqual(checker.buildUrlToTest(anUrl), anUrl, 'buildUrlToTest');

        // Self methods
        checker.setTest(new MockCasperTest());

        checker.doStandardCheckFromUrlList(urlsToCall);
        test.assertEqual(urlsCalled, urlsToCall, 'doStandardCheckFromUrlList');


        MockCasper.prototype.thenOpen = function(url, then) {
            test.assertEquals(url, anUrl, 'open 1 url');
            test.assertType(then, 'function', 'open 1 then');
        };
        checker.open(anUrl, fakeFunction);
        MockCasper.prototype.thenOpen = function(url, settings, then) {
            test.assertEqual(anUrl, url, 'open 2 url');
            test.assertEqual({method: "post"}, settings, 'open 2 settings');
            test.assertType(then, 'function', 'open 2 then');
        };
        checker.open(anUrl, {method: "post"}, fakeFunction);

        checker.checkPhpErrors();
        test.assertEqual(testResult, 'PASS No PHP error detected (Fatal, Parse, Warning, Uncaught exception, Blank page)', 'checkPhpErrors(undefined)');
        testResult = '';
        checker.checkPhpErrors([]);
        test.assertEqual(testResult, 'PASS No PHP error detected (Fatal, Parse, Warning, Uncaught exception, Blank page)', 'checkPhpErrors([])');
        testResult = '';
        checker.checkPhpErrors(['first error', 'second error']);
        test.assertEqual(testResult, 'FAIL PHP errors detected : first error\nsecond error\n', 'checkPhpErrors(errors)');

        testResult = '';
        checker.checkJsErrors();
        test.assertEqual(testResult, '', 'checkJsErrors without errors');
        checker.catchJsError('a js error', 'a trace');
        checker.checkJsErrors();
        test.assertEqual(testResult, '*** JS error check - start *** | a js error | *** JS error check - end *** | ', 'checkJsErrors with an error');
        testResult = '';
        checker.catchJsError('an other js error', 'an other trace');
        checker.checkJsErrors();
        test.assertEqual(testResult, '*** JS error check - start *** | a js error | an other js error | *** JS error check - end *** | ', 'checkJsErrors with 2 errors');

        testResult = '';
        test.assertEqual(checker.launchTest(), false, 'launchTest with errors');
        test.assertEqual(checker.launchTest(), true, 'launchTest without errors');
        test.assertEqual(testResult, 'PASS No PHP error detected (Fatal, Parse, Warning, Uncaught exception, Blank page)', 'launchTest calls checkPhpErrors');

        var MockResponseHeaders = function() {};
        MockResponseHeaders.prototype.data = {
            'Location': 'http://www.google.fr'
        };
        MockResponseHeaders.prototype.get = function(key) {
            return this.data[key];
        };
        var MockCurrentResponse = function() {};
        MockCurrentResponse.prototype.headers = new MockResponseHeaders();
        MockCasper.prototype.currentResponse = new MockCurrentResponse();
        MockCasper.prototype.status = function() {
            return { currentHTTPStatus: 301 };
        };
        MockCasper.prototype.waitForUrl = function(url, then, onTimeout, timeout) {
            if ('google.fr'.match(url)) {
                then();
            } else {
                onTimeout();
            }
        };
        
        cMock = new MockCasper();
        checker = new Checker(cMock, {});
        checker.setTest(test);

        // Test checkStatusCode
        checker.checkStatusCode(301);

        // Test checkHeaderLocation
        checker.checkHeaderLocation('google.fr');

        // Test checkRedirect
        checker.checkRedirect('google.fr');
    };

    exports.create = function(test, libPath) {
        return new TestCheckerToolkit(test, libPath);
    };
})();
