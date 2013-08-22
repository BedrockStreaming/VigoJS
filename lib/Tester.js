(function() {
    "use strict";

    var Tester = function (casper, utils) {
        Tester._super.constructor.call(this, casper);

        this.currentTestFilePath = '';

        this.assert =
        this.assertTrue = function assert(subject, message, context) {
            context = context || {};
            
            try {
                this.i.dont.exist += 0; // doesn't exist - that's the point
            } catch(e) {
                for (var i in e.stackArray) {
                    if (e.stackArray[i].sourceURL === this.currentTestFilePath){
                        context = utils.mergeObjects({
                            testFilePath: this.currentTestFilePath,
                            failLine: e.stackArray[i].line
                        }, context);
                        break;
                    }
                }
            }
            
            return Tester._super.assert.call(this, subject, message, context);
        };
    };

    exports.create = function (libPath, testerClass, casper, utils) {
        var inheritance = require(libPath + 'Inheritance');

        inheritance.inherits(Tester, testerClass);

        return new Tester(casper, utils);
    };
})();