(function() {
    /* jshint -W071 */
    
    "use strict";

    /**
     * ClubicChecker_Hp is part of ClubicChecker_Hp package
     * it provides all functionnalities to test clubic homepage
     * 
     * This module might be called using :
     *  var ClubicChecker = require('ClubicChecker_Hp').create();
     */
        
    /**
     * constructor of the module
     * 
     * @params string url
     * @params Object casperInstance
     */
    var ClubicChecker_Hp = function (casperInstance, config, properties) {
        ClubicChecker_Hp._super.constructor.call(this, casperInstance, config, properties);
        
        this.env = config.env;
        this.title = 'Test of main elements on Clubic Homepage';
        this.description = 'This test aims to check that main elements are present on Homepage : meta og, meta facebook, meta twitter, canonical url and main titles.';
        this.xunitClass = 'Clubic Homepage Test';
    };

    /**
     * static method that must have access to clubicChecker var and where this reports to phantom
     * this method will be injected inside CasperJS step
     * 
     */
    ClubicChecker_Hp.prototype.launchTest = function () {
        if (ClubicChecker_Hp._super.launchTest.call(this)) {
            var error = {},
            metas = [],
            expected = {url: this.url.replace('https:', 'http:').replace(/\?.*$/, '')};

            this.checkJsErrors();

            // check Meta
            metas = this.casper.evaluate(this.getMetaOg);

            this.checkMetaOg(metas, expected);
            this.checkMetaFb(metas);
            this.checkMetaTwt(metas, expected);
            this.checkCanonicalUrl(metas, expected);
            this.checkPage();
        } else {
            comment('Test stopped for module ClubicChecker_Hp');
        }
    };

    ClubicChecker_Hp.prototype.checkMetaOg = function (metas, expected) {
        if (metas.og.length !== 7) {
            this.test.fail('there should be 7 metaOg, only ' + metas.og.length + ' found');
            return null;
        }
        this.test.assertEquals(metas.og[0].property, 'og:description', 'metaOg description node');
        this.test.assertEquals(metas.og[0].content, "Actualité informatique en continu, Comparatifs et guides d'achat pour bien choisir, Logiciels pratiques, utiles ou juste amusant,  Forum d'aide et de dépannage sur Clubic.", 'metaOg url content');
        this.test.assertEquals(metas.og[1].property, 'og:image', 'metaOg image node');
        this.test.assertEquals(metas.og[1].content, 'http://img.clubic.com/0096000001486006-photo-logo-clubic.jpg', 'metaOg url content');
        this.test.assertEquals(metas.og[2].property, 'og:locale', 'metaOg locale node');
        this.test.assertEquals(metas.og[2].content, 'fr_fr', 'metaOg url content');
        this.test.assertEquals(metas.og[3].property, 'og:site_name', 'metaOg siteName node');
        this.test.assertEquals(metas.og[3].content, 'Clubic.com', 'metaOg url content');
        this.test.assertEquals(metas.og[4].property, 'og:title', 'metaOg title node');
        this.test.assertEquals(metas.og[4].content, 'Clubic : Actualité informatique, Comparatifs, Logiciels et Forum ', 'metaOg url content');
        this.test.assertEquals(metas.og[5].property, 'og:type', 'metaOg type node');
        this.test.assertEquals(metas.og[5].content, 'website', 'metaOg url content');
        this.test.assertEquals(metas.og[6].property, 'og:url', 'metaOg url node');
        this.test.assertEquals(metas.og[6].content, expected.url, 'metaOg url content');

        return this;
    };

    ClubicChecker_Hp.prototype.checkMetaFb = function (metas) {
        if (metas.fb.length !== 9) {
            this.test.fail('there should be 9 metaFb, only ' + metas.fb.length + ' found');
            return;
        }
        this.test.assertEquals(metas.fb[0].property, 'fb:admins', 'metaFb admins node');
        this.test.assertEquals(metas.fb[0].content, '100001066314771', 'metaFb admins content');
        this.test.assertEquals(metas.fb[1].property, 'fb:admins', 'metaFb admins node');
        this.test.assertEquals(metas.fb[1].content, '1199631238', 'metaFb admins content');
        this.test.assertEquals(metas.fb[2].property, 'fb:admins', 'metaFb admins node');
        this.test.assertEquals(metas.fb[2].content, '1623308123', 'metaFb admins content');
        this.test.assertEquals(metas.fb[3].property, 'fb:admins', 'metaFb admins node');
        this.test.assertEquals(metas.fb[3].content, '517833783', 'metaFb admins content');
        this.test.assertEquals(metas.fb[4].property, 'fb:admins', 'metaFb admins node');
        this.test.assertEquals(metas.fb[4].content, '562988567', 'metaFb admins content');
        this.test.assertEquals(metas.fb[5].property, 'fb:admins', 'metaFb admins node');
        this.test.assertEquals(metas.fb[5].content, '612833064', 'metaFb admins content');
        this.test.assertEquals(metas.fb[6].property, 'fb:admins', 'metaFb admins node');
        this.test.assertEquals(metas.fb[6].content, '746502852', 'metaFb admins content');
        this.test.assertEquals(metas.fb[7].property, 'fb:app_id', 'metaFb appId node');
        this.test.assertEquals(metas.fb[7].content, '302753377533', 'metaFb appId content');
        this.test.assertEquals(metas.fb[8].property, 'fb:page_id', 'metaFb pageId node');
        this.test.assertEquals(metas.fb[8].content, '96758232749', 'metaFb pageId content');

        return this;
    };

    ClubicChecker_Hp.prototype.checkMetaTwt = function (metas, expected) {
        if (metas.twitter.length !== 6) {
            this.test.fail('there should be 6 metaTwitter, only ' + metas.twitter.length + ' found');
            return;
        }
        this.test.assertEquals(metas.twitter[0].name, 'twitter:card', 'twitter cardType name');
        this.test.assertEquals(metas.twitter[0].content, 'summary', 'twitter cardType content');
        this.test.assertEquals(metas.twitter[1].name, 'twitter:description', 'twitter desc name');
        this.test.assertEquals(metas.twitter[1].content, "Actualité informatique en continu, Comparatifs et guides d'achat pour bien choisir, Logiciels pratiques, utiles ou juste amusant,  Forum d'aide et de dépannage sur Clubic.", 'twitter desc content');
        this.test.assertEquals(metas.twitter[2].name, 'twitter:image', 'twitter image name');
        this.test.assertEquals(metas.twitter[2].content, 'http://img.clubic.com/0096000001486006-photo-logo-clubic.jpg', 'twitter image content');
        this.test.assertEquals(metas.twitter[3].name, 'twitter:site', 'twitter site name');
        this.test.assertEquals(metas.twitter[3].content, '@Clubic', 'twitter site content');
        this.test.assertEquals(metas.twitter[4].name, 'twitter:title', 'twitter title name');
        this.test.assertEquals(metas.twitter[4].content, 'Clubic : Actualité informatique, Comparatifs, Logiciels et Forum ', 'twitter title content');
        this.test.assertEquals(metas.twitter[5].name, 'twitter:url', 'twitter url name');
        this.test.assertEquals(metas.twitter[5].content, expected.url, 'twitter url content');

        return this;
    };

    ClubicChecker_Hp.prototype.checkCanonicalUrl = function (metas, expected) {
        if (metas.canonical.length !== 1) {
            this.test.fail('there should be 1 canonical href, only ' + metas.canonical.length + ' found');
            return;
        }
        this.test.assertEquals(metas.canonical[0].href, expected.url, 'Canonical');

        return this;
    };

    ClubicChecker_Hp.prototype.checkImageSrc = function (metas) {
        if (metas.image_src.length === 0) {
            return; // no test to do
        }

        if (metas.image_src.length > 1) {
            this.test.fail('there should be 1 image_src href, only ' + metas.image_src.length + ' found');
            return;
        }

        this.test.assertEquals(metas.image_src[0].href, metas.og[1].content, 'metaOg imageSrc check');
        this.test.assertEquals(metas.image_src[0].href, metas.twitter[2].content, 'twitterCard imageSrc check');

        return this;
    };

    ClubicChecker_Hp.prototype.checkPage = function () {
        this.test.assertTitle('Clubic : Actualité informatique, Comparatifs, Logiciels et Forum', 'page title');
        this.test.assertSelectorHasText('h1', "Toute l'actu high-tech", 'h1 content');
        this.test.assertSelectorHasText('h2', "// S'INFORMER", 'h2 content');

        return this;
    };

    ClubicChecker_Hp.prototype.buildUrlToTest = function (url) {
        if (!url){
            if (this.config.env === 'prod') {
                url = 'http://www.clubic.com/';
            } else if (this.config.env === 'dev') {
                url = 'http://dev.clubic.com/';
            }
        }

        return ClubicChecker_Hp._super.buildUrlToTest.call(this, url);
    };

    exports.create = function create(casperInstance, config, properties) {
        var inheritance = require(config.libPath + 'Inheritance'),
            CheckerToolkit = require(config.libPath + 'checker/CheckerToolkit')(config.libPath);

        inheritance.inherits(ClubicChecker_Hp, CheckerToolkit);

        return new ClubicChecker_Hp(casperInstance, config, properties);
    };
})();
