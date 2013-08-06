(function() {
    /* jshint -W071 */
    
    "use strict";

    /**
     * M6CorpoChecker_HpPro is part of M6CorpoChecker package
     * it provides all functionnalities to test pro homepages of groupem6 website
     * 
     * This module might be called using :
     *  var M6CorpoChecker = require('M6CorpoChecker_HpPro').create();
     */
        
    /**
     * constructor of the module
     * 
     * @params string url
     * @params Object casperInstance
     */
    var M6CorpoChecker_HpPro = function (casperInstance, config, properties) {
        // call parent constructor
        M6CorpoChecker_HpPro._super.constructor.call(this, casperInstance, config, properties);

        this.proWebSites = ['m6pro', 'w9pro', 'tevapro', '6terpro'];
        this.title = 'Test of M6 pro websites';
        this.description = 'This test checks that each pro websites is OK : homepage loading, header, program grid and program bulletin.';
    };

    /**
     * static method that must have access to M6CorpoChecker var and where this reports to phantom
     * this method will be injected inside CasperJS step
     * 
     */
    M6CorpoChecker_HpPro.prototype.launchTest = function () {
        if (M6CorpoChecker_HpPro._super.launchTest.call(this)) {
            var context = this;

            // Connexion
            this.casper.evaluate(function fillForm() {
                document.querySelector('input[name=login]').value = 'login';
                document.querySelector('input[name=password]').value = 'pwd';
                document.querySelector('#logButton').click();
            });

            this.casper.waitForSelector('#logged', function () {
                this.test.pass('M6CorpoChecker_HpPro login successfull');
            }, function onTimeOut() {
                // @TODO assume buildPath is set somewhere... BAD
                this.capture(context.config.buildPath + '/loginfailed.png');
                this.test.fail('M6CorpoChecker_HpPro timeout on waitForSelector #logged');
            }, 30000);
            
            // Pour chaque site Pro
            var baseUrl   = this.getUrl().replace('m6pro/', ''),
                casper    = this.casper,
                test      = this.test,
                buildPath = this.config.buildPath,
                thenOpen  = function (arg) {
                    var fs        = require('fs'),
                        reg       = new RegExp(baseUrl),
                        siteName  = arg.url.replace(reg, '').replace(/\//, ''),
                        logPrefix = 'M6CorpoChecker_HpPro [' + siteName + '] ';
                    
                    comment('# Test ' + siteName, 'COMMENT');

                    // 301
                    var status = test.assertUrlMatch(arg.url, logPrefix + 'page url is ' + arg.url);
                    if (!status.success){
                        reg = new RegExp(baseUrl);
                        casper.capture(buildPath + '/locationfailed_' + siteName + '.png');
                        return false;
                    }
                    
                    // Erreurs PHP
                    var errPhp = casper.evaluate(context.getPhpErrors);
                    context.checkPhpErrors(errPhp);
                    
                    // Structure de la page
                    var stat1 = test.assertVisible('#headerPerso #slide0', logPrefix + 'page has an perso header with at least a visible slide'),
                        stat2 = test.assertEval(function() {
                            return document.querySelectorAll('.module_grille_programmes .chaineProgram .emission').length > 0;
                        }, logPrefix + 'page has the program grid with at least one diffusion'),
                        stat3 = test.assertVisible('.module_grille_programmes .plugin_download', logPrefix + 'page has the programs bulletin link');
                    
                    if (!(stat1.success && stat2.success && stat3.success)){
                        casper.capture(buildPath + '/structurefailed' + siteName + '.png');
                    }
                    
                    // PDF du bulletin des programmes
                    var pdfUrl = casper.evaluate(function getUrlPdf(){
                        return document.querySelector('.module_grille_programmes .plugin_download').getAttribute('href');
                    });
                    var pdfPath = buildPath + '/bulletin_' + siteName + '.pdf';
                    casper.download(pdfUrl, pdfPath);

                    if (fs.exists(pdfPath) && fs.size(pdfPath) > 500000){
                        test.pass(logPrefix + 'programs bulletin is ok');
                    } else {
                        test.fail(logPrefix + 'programs bulletin is nok');
                    }

                    return null;
                };

            for (var i = 0; i < this.proWebSites.length; i++) {
                this.open(baseUrl + this.proWebSites[i] + '/', thenOpen);
            }
        } else {
            comment('Test stopped for module M6CorpoChecker_HpPro');
        }
    };

    M6CorpoChecker_HpPro.prototype.buildUrlToTest = function (url) {
        if (!url){
            return 'http://www.groupem6.fr/m6pro/';
        }

        return M6CorpoChecker_HpPro._super.buildUrlToTest.call(this, url);
    };

    exports.create = function create(casperInstance, config, properties) {
        
        var inheritance = require(config.libPath + 'Inheritance'),
            CheckerToolkit = require(config.libPath + 'checker/CheckerToolkit')(config.libPath);

        inheritance.inherits(M6CorpoChecker_HpPro, CheckerToolkit);

        return new M6CorpoChecker_HpPro(casperInstance, config, properties);
    };
})();
