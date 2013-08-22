(function(){
    "use strict";

    var sys = require('system');

    // CasperJS injection in PhantomJS
    phantom.casperPath = sys.env['CASPERJS_PATH'];
    phantom.injectJs(phantom.casperPath + 'bin/bootstrap.js');
    phantom.casperTest = true;

    // Required modules and init
    var date     = new Date(),
        fs       = require('fs'),
        casper   = require('casper').create(),
        path     = fs.absolute('./'),
        libPath = fs.absolute('../lib/'),
        sequence = require(libPath + 'Sequence')(fs);

    // Global helpers
    require(libPath + 'Helpers.js')(casper);

    // Tests sequence building
    sequence.add(path, /test[^\/]+$/);

    // Build path creation
    var buildPath = fs.absolute(casper.cli.get('buildPath'));
    if (!fs.isDirectory(buildPath)) {
        casper.echo('Creation of the build folder: ' + buildPath);
        fs.makeDirectory(buildPath);
    }

    // Tests sequence launch
    var interval = setInterval(function (test) {
        if (test.running) {
            return;
        }
        if (test.currentSuiteNum === sequence.list.length || test.aborted) {
            // Results display
            casper.echo('Process ended, xml result is going to be generated.');
            test.renderResults(true, 0, buildPath + '/test_' + date.getTime() + '.xml');
            clearInterval(interval);
        } else {
            var item = sequence.list[test.currentSuiteNum];
            test.currentTestFile = item.name;

            casper.test.begin('[' + item.name.replace(fs.workingDirectory + '/', '') + ']', function(tester) {
                casper.start().then(function() {
                    require(item.module).create(test, libPath, fs);
                }).run(function() {
                    tester.done();
                });
            });

            test.currentSuiteNum++;
        }
    }, 20, casper.test);
})();