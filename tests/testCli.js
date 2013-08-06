(function () {
    "use strict";

    var TestCli = function (test, libPath, fs) {
        
        var MockCasper    = function () {},
            MockCasperCli = function () {},
            utils      = require(libPath + 'Utils')(fs),
            Cli;

        comment('# Unit tests for Cli');

        MockCasperCli.prototype.get = function (key) {
            if (key === 'cmdDir') {
                return '/root_path/sub_path/';
            } else if (key === 0) {
                return '../test_path/tests';
            }

            return null;
        }

        MockCasper.cli = new MockCasperCli();
        Cli = require(libPath + 'Cli')(null, MockCasper, utils);

        test.assertEquals(Cli.getPath('../a_path'), '/root_path/a_path', 'getPath with a relative path');
        test.assertEquals(Cli.getPath(), '/root_path/sub_path/', 'getPath without parameter');

        test.assertEquals(Cli.getTestPath(), '/root_path/test_path/tests', 'getTestPath');
    };

    exports.create = function(test, libPath, fs){
        return new TestCli(test, libPath, fs);
    };
})();
