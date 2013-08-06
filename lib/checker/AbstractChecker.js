(function() {
    "use strict";

    /**
     * AbstractChecker is part of VigoJS package
     * It provides all functionnalities to test web pages with VigoJS
     *
     * This module might be called using :
     * var AbstractChecker = require('AbstractChecker').create();
     */

    /**
     * Constructor
     *
     * @params Object casperInstance
     * @params array config
     * @params Object properties
     */
    var AbstractChecker = function (casperInstance, config, properties) {
        if (typeof casperInstance.echo === 'undefined') {
            throw 'Pay attention at the parameter sent to constructor, casperInstance is not passed as it should';
        }

        this.casper      = casperInstance;
        this.test        = undefined;
        this.config      = config;
        this.url         = this.buildUrlToTest(this.config.testedUrl);
        this.name        = (typeof properties !== 'undefined' ? properties.name : '');
        this.title       = '';
        this.description = '';
        this.xunitClass  = '';
    };

    /**
     * Method that will be called by VigoJS to launch tests
     * Must be overriden
     *
     * @override true
     * @return void
     */
    AbstractChecker.prototype.launchTest = function () {

        // Write your tests here

        throw '`launchTest` method must be overriden by your module.';
    };

    /**
     * Get the url used to launchTest on
     *
     * @return string url
     */
    AbstractChecker.prototype.getUrl = function () {
        return this.url;
    };

    /**
     * Set the tested url
     *
     * @return AbstractChecker
     */
    AbstractChecker.prototype.setUrl = function (testedUrl) {
        this.url = testedUrl;

        return this;
    };

    /**
     * Set the tester instance
     *
     * @return AbstractChecker
     */
    AbstractChecker.prototype.setTest = function (test) {
        this.test = test;

        return this;
    };

    /**
     * Build tested url
     * Can be overriden
     * For instance, the url format can depend on test environment (accessible from config)
     *
     * @return string url
     */
    AbstractChecker.prototype.buildUrlToTest = function (url) {
        if (url && this.config.urlParameters) {
            url = url.replace(/(?:(\?)([^#]+))?(#.*)?$/, '?' + this.config.urlParameters + '&$2$3').replace(/&$/, '').replace('&#', '#');
        }

        return url;
    };

    module.exports = function (){
        return AbstractChecker;
    };
})();