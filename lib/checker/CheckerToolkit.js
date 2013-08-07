(function() {
    /* jshint -W071 */
    /* jshint -W074 */

    "use strict";

    /**
     * CheckerToolkit is part of VigoJs package
     * It provides extra features to easily test web pages with VigoJS
     *
     * This module might be called using :
     * var CheckerToolkit = require('CheckerToolkit').create();
     */

    /**
     * Constructor
     *
     * @params Object casperInstance
     * @params array config
     */
    var CheckerToolkit = function (casperInstance, config, properties) {
        var currentObject = this;

        CheckerToolkit._super.constructor.call(this, casperInstance, config, properties);

        // Page error callback
        casperInstance.once('page.error', function onError(msg, trace) {
            currentObject.catchJsError(msg, trace);
        });

        this.getMetaOg = CheckerToolkit.getMetaOg;
        this.getPhpErrors = CheckerToolkit.getPhpErrors;
        this.jsErrors = [];
    };

    /**
     * Basic tests
     * Return true if no PHP error has been detected
     *
     * @return boolean
     */
    CheckerToolkit.prototype.launchTest = function () {
        var errPhp = this.casper.evaluate(this.getPhpErrors),
            errBeforeCommoncheck,
            errAfterCommoncheck;

        errBeforeCommoncheck = this.test.suiteResults.getAllFailures().length;
        this.checkStatus();
        this.checkPhpErrors(errPhp);
        errAfterCommoncheck = this.test.suiteResults.getAllFailures().length;

        return (errAfterCommoncheck === errBeforeCommoncheck);
    };

    /**
     * Opens an url and makes some stuff on this page
     * 
     * @return CheckerToolkit
     */
    CheckerToolkit.prototype.open = function (url, settings, then) {
        var self = this,
            stuffToDo;

        url = this.buildUrlToTest(url);

        if (!(settings && typeof settings !== 'function')) {
            then = settings;
            settings = null;
        }

        stuffToDo = function (arg) {
            self.test.info('*** Open ' + url + ' ***');
            then(arg);
        };

        if (settings){
            this.casper.thenOpen(url, settings, stuffToDo);
        } else {
            this.casper.thenOpen(url, stuffToDo);
        }

        return this;
    };

    /**
     * The aim is to do massive check
     * So it loop on a list of url to check for PHP errors
     *
     * @params array list
     * @params boolean noticeEnable
     * 
     * @TODO maybe a callback could be send as arguments, but this not the first aim of this method
     */
    CheckerToolkit.prototype.doStandardCheckFromUrlList = function (list, noticeEnable) {

        if(typeof(noticeEnable) == 'undefined'){
            noticeEnable = false;
        }

        var currentCheck = this,
            context      = this.casper,
            buildPath    = this.config.buildPath;

        var launchTestOnUrl = function () {
            var phpError = context.evaluate(currentCheck.getPhpErrors, noticeEnable),
                errBefore,
                errAfter,
                captureFilename;

            errBefore = context.test.getFailures();
            currentCheck.checkStatus();
            currentCheck.checkPhpErrors(phpError);
            errAfter = context.test.getFailures();

            if (errAfter.length > errBefore.length) {
                captureFilename = context.status().requestUrl.replace(':', '_').split('/').join('_');
                context.capture(buildPath + '/' + captureFilename + '.png');
            }
        };

        for (var i = 0; i < list.length; i++) {
            this.open(this.buildUrlToTest(list[i]), launchTestOnUrl);
        }
    };

    /**
     * Check for HTTP status errors
     *
     * @return CheckerToolkit
     */
    CheckerToolkit.prototype.checkStatus = function () {
        var status = this.casper.status().currentHTTPStatus ? this.casper.status().currentHTTPStatus.toString() : '';

        if (status.match(/^2[0-9]{2}$/)){
            this.test.pass('HTTP success status (2xx) detected');
        } else if (status.match(/^3[0-9]{2}$/)){
            this.test.info('Url ' + this.casper.status().requestUrl + ' is redirected (HTTP status code 3xx detected)');
        } else {
            this.test.fail('HTTP status error (4xx, 5xx) detected while opening url ' + this.casper.status().requestUrl);
        }

        return this;
    };

    /**
     * Check redirect response
     *
     * @param url
     * @param statusCode
     */
    CheckerToolkit.prototype.checkRedirect = function(url, statusCode) {
        if (statusCode === undefined) {
            statusCode = 301;
        }

        this.checkStatusCode(statusCode);
        this.checkHeaderLocation(url);
    };

    /**
     * Check HTTP status code
     *
     * @param string statusCode
     */
    CheckerToolkit.prototype.checkStatusCode = function(statusCode) {
        var currentStatusCode = this.casper.status().currentHTTPStatus;
        this.test.assertEquals(currentStatusCode, statusCode, 'Status code ' + statusCode + ' expected');
    };

    /**
     * Check header location
     *
     * @param string url
     */
    CheckerToolkit.prototype.checkHeaderLocation = function(url) {
        var currentLocation = this.casper.currentResponse.headers.get('Location');
        if (typeof url !== 'RegExp') {
            url = new RegExp(url);
        }
        this.test.assertMatch(currentLocation, url, 'Location ' + url + ' expected');
    };

    /**
     * Check for standard PHP errors
     *
     * @params array phpErrorRes
     * @return CheckerToolkit
     */
    CheckerToolkit.prototype.checkPhpErrors = function (phpErrorRes) {
        if (typeof phpErrorRes !== 'undefined' && (phpErrorRes.length > 0)) {
            var err = "";
            phpErrorRes.forEach(function (item, index) {
                err += item + "\n";
            });
            this.test.fail('PHP errors detected : ' + err);
            
            return this;
        }

        this.test.pass('No PHP error detected (Fatal, Parse, Warning, Uncaught exception, Blank page)');

        return this;
    };

    /**
     * Launch a warning for each JS error
     *
     * Be carefull, it seems that Phantom return only the first error
     */
    CheckerToolkit.prototype.checkJsErrors = function () {
        if (this.jsErrors.length > 0) {
            this.test.info('*** JS error check - start ***');

            var currentObject = this;
            this.jsErrors.forEach(function loopOverJsErrors (item, index) {
                currentObject.test.info(item.msg);
                currentObject.casper.echo(JSON.stringify(item.trace));
            });

            this.test.info('*** JS error check - end ***');
        }
    };

    /**
     * Catch Javascript Error and store them in _jsError array
     *
     * @return void
     */
    CheckerToolkit.prototype.catchJsError = function (msg, trace) {
        this.jsErrors.push({"msg": msg, "trace": trace});
    };

    /**
     * Get metasOG from webpage and some other meta node
     *
     * @return array metas with following keys {og: [], fb: [], twitter: [], canonical: [], image_src: [], unknown: []}
     */
    CheckerToolkit.getMetaOg = function () {
        var metas = {og: [], fb: [], twitter: [], canonical: [], image_src: [], unknown: []},
        metaParser = function (elem) {
            var meta = {};
            [].slice.call(elem.attributes).forEach(function (attr) {
                meta[attr.name] = attr.value;
            });
            // twitter
            if (elem.hasAttribute('name')) {
                if (elem.attributes.name.value.substr(0, 1) === 't') {
                    metas.twitter.push(meta);
                } else {
                    meta.err = 1;
                    metas.unknown.push(meta);
                }
            // og && fb
            } else if (elem.hasAttribute('property')) {
                if (elem.attributes.property.value.substr(0, 1) === 'o' || elem.attributes.property.value.substr(0, 8) === 'article:' || elem.attributes.property.value.substr(0, 8) === 'profile:') {
                    metas.og.push(meta);
                } else if (elem.attributes.property.value.substr(0, 1) === 'f') {
                    metas.fb.push(meta);
                } else {
                    meta.err = 2;
                    metas.unknown.push(meta);
                }
            // other node type
            } else {
                if (elem.nodeName.toLowerCase() === 'link' && elem.hasAttribute('rel')) {
                    if (elem.attributes.rel.value === 'canonical') {
                        metas.canonical.push(meta);
                    } else if (elem.attributes.rel.value === 'image_src') {
                        metas.image_src.push(meta);
                    } else {
                        meta.err = 4;
                        metas.unknown.push(meta);
                    }
                } else {
                    meta.err = 3;
                    metas.unknown.push(meta);
                }
            }
        };
        [].forEach.call(document.querySelectorAll('meta[property^="og:"]'), metaParser);
        [].forEach.call(document.querySelectorAll('meta[property^="profile:"]'), metaParser);
        [].forEach.call(document.querySelectorAll('meta[property^="article:"]'), metaParser);
        [].forEach.call(document.querySelectorAll('meta[property^="fb:"]'), metaParser);
        [].forEach.call(document.querySelectorAll('meta[name^="twitter:"]'), metaParser);
        [].forEach.call(document.querySelectorAll('link[rel="canonical"]'), metaParser);
        return metas;
    };

    /**
     * Get standard PHP errors inside the webpage
     *
     * @params boolean noticeEnable
     * 
     * @return array res
     */
    CheckerToolkit.getPhpErrors = function (noticeEnable) {

        if(typeof(noticeEnable) == 'undefined'){
            noticeEnable = false;
        }

        var res = [];
        if (document.body) {
            if (document.body.innerHTML.indexOf('Fatal error') !== -1) {
                res.push('Fatal error found');
            }

            if (document.body.innerHTML.indexOf('Parse error') !== -1) {
                res.push('Parse error found');
            }

            if (document.body.innerHTML.indexOf('Uncaught exception') !== -1) {
                res.push('Uncaught exception found');
            }

            if (document.body.innerHTML.indexOf('Warning') !== -1) {
                res.push('Warning found');
            }

            if (noticeEnable && document.body.innerHTML.indexOf('Notice') !== -1) {
                res.push('Notice found');
            }

            if (document.body.innerHTML.trim().length === 0) {
                res.push('Blank page found');
            }
        }

        return res;
    };

    /**
     * Display log for complex Object
     */
    CheckerToolkit.prototype.logComplexObject = function (oneObject, level) {
        var self = this,
            space = '    ';

        level = level + 1 || 0;

        for (var i = 0; i < level; i++) {
            space += '    ';
        }

        if (!level) {
            this.casper.echo('(' + typeof oneObject + ')');
        }

        if (level > 2) {
            this.casper.echo(space + 'Depth limit reach, log will not continue on that branch');
            return;
        }

        try {
            Object.getOwnPropertyNames(oneObject).forEach(function (propName) {
                this.casper.echo( space + '(' + typeof oneObject[propName] + ') ' + propName);
                if (typeof oneObject[propName] === 'object') {
                    self.logComplexObject(oneObject[propName], level);
                }
            });
        } catch (e) {

        }
    };

    module.exports = function (libPath){
        var inheritance = require(libPath + 'Inheritance'),
            AbstractChecker = require(libPath + 'checker/AbstractChecker')();

        inheritance.inherits(CheckerToolkit, AbstractChecker);

        return CheckerToolkit;
    };
})();