(function () {
    /* jshint -W071 */
    /* jshint -W074 */

    /**
     * This script is called with this command :
     *      ./vigojs  <tests path> [options]
     *
     * You can use config.json to store some params like login/pwd/buildPath
     * If options are both in config.json and cli params, those cli params will be used first
     *
     * Actually phantomJs doesn't provide any way to disable specific resource loading.
     * Some javascript provided by advertiser may break the process. So, waiting for a solution from phantom to
     * improve their event onResourceRequested, you may have to modify your hosts (it works actually wihout this tips) :
     *      127.0.0.1       cstatic.weborama.fr
     *
     * @params string path
     * @params string env (default is prod)
     * @params string buildPath (default in ./build folder)
     * @params string login
     * @params string pwd
     * @params string configPath
     */

    "use strict";
    
    var casperOptions = {
        verbose: false,
        logLevel: "info"
    };

    // Parameters
    var date    = new Date(),
        fs      = require('fs'),
        sys     = require('system'),
        libPath = fs.absolute('./lib/');

    // Phantom JS Setup
    phantom.casperPath = sys.env['CASPERJS_PATH'];
    phantom.injectJs(phantom.casperPath + 'bin/bootstrap.js');
    phantom.casperTest = true;

    // Casper and VigoJS helpers
    var genuineCasper = require('casper').Casper,
        casper        = require(libPath + 'Casper').create(libPath, genuineCasper, casperOptions),
        utils         = require('utils'),
        vigoUtils     = require(libPath + 'Utils')(fs),
        configurator  = require(libPath + 'Configurator')(utils),
        cli           = require(libPath + 'Cli')(fs.absolute('.') + '/config/config.definition.json', casper, vigoUtils),
        sequence      = require(libPath + 'Sequence')(fs);

    // Global helpers
    require('./lib/Helpers.js')(casper);

    // Help display
    if (casper.cli.has('help')) {
        cli.showHelp();
        casper.exit();
        return;
    }

    // Checking tests path
    if (!casper.cli.get(0)) {
        casper.echo('No tests path is specified.', 'ERROR').exit(1);
    } else if (!fs.exists(cli.getTestPath())) {
        casper.echo('The file or directory `' + cli.getTestPath() + '` does not exist.', 'ERROR').exit(1);
    }

    // VigoJS configuration generation
    var config = configurator
        // Default configuration
        .addConfigHandler(function () {
            return JSON.parse(fs.read('./config/config.json'));
        })
        // Project configuration
        .addConfigHandler(function (path) {
            var pathSplit = (typeof path !== 'undefined' && path ? path.split('/') : cli.getTestPath().split('/'));
            var config    = {};
            
            while (pathSplit.length > 1) {
                if (fs.exists(pathSplit.join('/') + '/.vigojs.json')) {
                    var cfgObject = JSON.parse(fs.read(pathSplit.join('/') + '/.vigojs.json'));
                    // require as first argument because closest config file has priority
                    config = utils.mergeObjects(cfgObject, config);
                }
                
                pathSplit.pop();
            }
            
            return config;
        })
        // User configuration
        .addConfigHandler(function () {
            return ( typeof casper.cli.options['configPath'] !== 'undefined' ? JSON.parse(fs.read(cli.getPath(casper.cli.options['configPath']))) : {});
        })
        // CLI Configuration
        .addConfigHandler(function () {
            return casper.cli.options;
        })
        .addConfigHandler(function (path, config){
            var tmpConfig = {};

            if (typeof config !== 'undefined') {
                tmpConfig.buildPath = config.buildPath;
            }

            tmpConfig.libPath = libPath;
            tmpConfig.currentTestPath = path;

            return tmpConfig;
        })
        .getConfig();

    // Tests sequence building    
    sequence.add(cli.getTestPath());
    
    // Build path resolution
    config.buildPath = cli.getPath(config.buildPath) + '/' + date.getTime();

    if (!fs.isDirectory(config.buildPath)) {
        casper.echo('Creation of the build folder: ' + config.buildPath);
        fs.makeDirectory(config.buildPath);
    }

    // CasperJS init
    casper.init(config.buildPath, 'test_' + date.getTime() + '.xml');

    // Tests sequence launch
    var interval = setInterval(function (test) {
        if (test.running) {
            return;
        }
        if (test.currentSuiteNum === sequence.list.length || test.aborted) {
            // Results display
            test.emit('tests.complete');
            clearInterval(interval);
        } else {
            var item = sequence.list[test.currentSuiteNum];
            config = configurator.getConfig(item.dir, config);
            var module = require(item.module).create(casper, config, item);

            // Check that module implements required methods
            if (typeof module.launchTest === 'undefined' || typeof module.getUrl === 'undefined' || typeof module.setTest === 'undefined') {
                casper.echo('Checker ' + item.name + ' does not implement required methods `launchTest`, `getUrl` and/or `setTest`.', 'ERROR').exit(1);
            }

            var url = module.getUrl();

            casper.echo('[' + item.name + ']' + (url ? ' - Main url : ' + url : ''), 'INFO_BAR');
            test.currentTestFile = module.xunitClass || item.name;

            casper.test.begin(module.title ? module.title : 'Untitled test suite', function(tester) {
                module.setTest(tester);
                casper.start();

                // Infos display
                if (module.description){
                    comment('## ' + module.description);
                }

                // Casper environement configuration        
                casper.viewport(config.viewportWidth, config.viewportHeight);
                if (config.login && config.pwd) {
                    casper.setHttpAuth(config.login, config.pwd);
                }

                // Test launch
                casper.thenOpen(url, function() {
                    module.launchTest();
                }).run(function() {
                    tester.done();
                });
            });

            test.currentSuiteNum++;
        }
    }, 20, casper.test);
})();