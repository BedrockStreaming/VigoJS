(function () {
    "use strict";

    var TestUtils = function (test, libPath, fs) {

        var utils = require(libPath + 'Utils')(fs);

        comment('# Unit tests for Utils');

        test.assertEqual(utils.arrayKeys(['a', 'i', 'p']), ['0', '1', '2'], 'arrayKeys for Array');
        test.assertEqual(utils.arrayKeys({a: 'b', c: 'd'}), ['a', 'c'], 'arrayKeys for Object');

        test.assertEqual(utils.arrayMaxLength({ab: 'a', abcdefgh: 'b', abc: 'c'}), 8, 'arrayMaxLength');

        test.assertEqual(utils.pad(12, 4), '1200', 'pad');
        test.assertEqual(utils.pad(12, 4, '-'), '12--', 'pad with -');
    };

    exports.create = function(test, libPath, fs){
        return new TestUtils(test, libPath, fs);
    };
})();
