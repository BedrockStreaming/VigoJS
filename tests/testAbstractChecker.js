(function () {
    "use strict";

    var TestAbstractChecker = function (test, libPath) {

        var Checker = require(libPath + 'checker/AbstractChecker')(),
            checker;

        comment('# Unit tests for AbstractChecker');

        var MockCasper = function() {};
        MockCasper.prototype.echo = function() {};
        checker = new Checker(new MockCasper(), {});

        test.assertEqual(checker.getUrl(), undefined, 'getUrl before setting url');
        checker.setUrl('http://www.m6.fr/');
        test.assertEqual(checker.getUrl(), 'http://www.m6.fr/', 'getUrl after setting url');

        test.assertEqual(checker.test, undefined, 'Tester before setting test');
        checker.setTest('a tester');
        test.assertEqual(checker.test, 'a tester', 'Tester test after setting test');

        try {
            checker.launchTest();
            test.fail('launchTest must throw exception');
        } catch (e) {
            test.assertEqual(e, '`launchTest` method must be overriden by your module.', 'launchTest throw exception');
        }

        test.assertEqual(checker.buildUrlToTest('http://www.m6.fr/'), 'http://www.m6.fr/', 'buildUrlToTest');

        checker.config = {urlParameters: 'param=1&param2=true'};
        test.assertEqual(checker.buildUrlToTest('http://www.m6.fr/'), 'http://www.m6.fr/?param=1&param2=true', 'buildUrlToTest with url parameters 1');
        test.assertEqual(checker.buildUrlToTest('http://www.m6.fr/#anchor'), 'http://www.m6.fr/?param=1&param2=true#anchor', 'buildUrlToTest with url parameters 2');
        test.assertEqual(checker.buildUrlToTest('http://www.m6.fr/?a=raoul#25'), 'http://www.m6.fr/?param=1&param2=true&a=raoul#25', 'buildUrlToTest with url parameters 3');
    };

    exports.create = function(test, libPath) {
        return new TestAbstractChecker(test, libPath);
    };
})();