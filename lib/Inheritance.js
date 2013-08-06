(function() {
    
    "use strict";

    /**
     * Inheritance is part of VigoJS package
     * It provides all functionnalities to use inheritance
     * 
     * This module might be called using :
     * var Inheritance = require('Inheritance').create();
     * 
     * Code has been hugely inspired by this (thanks Alex) : http://www.2ality.com/2012/01/js-inheritance-by-example.html
     */

    /**
     * Copy property from source to target
     * 
     * @params Object target
     * @params Object source

     * @return Object target
     */
    exports.extend = function extendProp(target, source) {
        Object.getOwnPropertyNames(source).forEach(function (propName) {
            Object.defineProperty(target, propName,
                Object.getOwnPropertyDescriptor(source, propName));
        });

        return target;
    };

    /**
     * Copy prototype from Super to Sub
     *
     * @params Object target
     * @params Object source

     * @return void
     */
    exports.inherits = function inheritsProto(SubC, SuperC) {
        var subProto = Object.create(SuperC.prototype);
        // At the very least, we keep the "constructor" property
        // At most, we keep additions that have already been made
        this.extend(subProto, SubC.prototype);
        SubC.prototype = subProto;
        SubC._super = SuperC.prototype;
    };
})();