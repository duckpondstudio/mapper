/**
 * Global reference to document CSS
 * @type {CSSStyleDeclaration}
 */
export let css;

/** Load CSS style reference, run once at start and again whenever CSS style changes */
export function LoadCSS() {
    // load css reference 
    css = getComputedStyle(document.documentElement);
}

/**
 * Add/modify the given CSS rule
 * @param {string} name name of the CSS class, eg ".body" 
 * @param {string} rule CSS rule to modify, eg "color:#ff0000"
 */
export function SetCSSRule(name, rule) {
    cssClassBuilder.addRule(name, rule);
    LoadCSS();
}

// credit to:
// https://stackoverflow.com/questions/1720320/how-to-dynamically-create-css-class-in-javascript-and-apply#comment120218842_8630641
let CSSClassBuilder = function () {
    var styleSheet;
    var pub = {};


    var constructor = function () {
        if (!styleSheetsExist() || !headElementExists())
            return;

        getStyleSheet();
        if (typeof styleSheet === 'undefined') {
            makeStyleSheet();
        }
    }

    var MediaType = function (styleSheet, media) {
        var styleSheet = styleSheet;
        var media = media;

        this.mediaType = function () {
            return media;
        }
        this.styleSheet = function () {
            return styleSheet;
        }
    }

    var StringMediaType = function (styleSheet) {
        var pub = {};
        MediaType.call(pub, styleSheet, "string");

        pub.addRule = function (selector, style) {
            for (var i = 0, l = styleSheet.rules.length; i < l; i++) {
                if (styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                    styleSheet.rules[i].style.cssText = style;
                    return;
                }
            }
            styleSheet.addRule(selector, style);
        }

        pub.removeRule = function (selector) {
            for (var i = 0; i < styleSheet.rules.length; i++) {
                if (styleSheet.rules[i].selectorText.toLowerCase() === selector.toLowerCase()) {
                    styleSheet.removeRule(i);
                }
            }
        }

        return pub;
    }

    StringMediaType.isString = function (styleSheet) {
        var media = styleSheet.media;
        var mediaType = typeof media;
        if (mediaType === 'string') {
            if (media === '' || (media.indexOf('screen') !== -1)) {
                return true;
            }
        }
        return false;
    }

    var ObjectMediaType = function (styleSheet) {
        var pub = {};
        MediaType.call(pub, styleSheet, "object");
        var pub = {};

        pub.addRule = function (selector, style) {
            var styleSheetLength = (styleSheet.cssRules) ? styleSheet.cssRules.length : 0;
            for (var i = 0; i < styleSheetLength; i++) {
                if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                    styleSheet.cssRules[i].style.cssText = style;
                    return;
                }
            }
            styleSheet.insertRule(selector + '{' + style + '}', styleSheetLength);
        }

        pub.removeRule = function (selector) {
            for (var i = 0; i < styleSheet.cssRules.length; i++) {
                if (styleSheet.cssRules[i].selectorText.toLowerCase() === selector.toLowerCase()) {
                    styleSheet.deleteRule(i);
                }
            }
        }
        return pub;
    }

    ObjectMediaType.isObject = function (styleSheet) {
        var media = styleSheet.media;
        var mediaType = typeof media;
        if (mediaType == 'object') {
            if (media.mediaText === '' || (media.mediaText.indexOf('screen') !== -1)) {
                return true;
            }
        }
        return false;
    }
    var makeMediaType = function (styleSheet) {
        if (StringMediaType.isString(styleSheet)) {
            return StringMediaType(styleSheet);
        } else if (ObjectMediaType.isObject(styleSheet)) {
            return ObjectMediaType(styleSheet);
        } else {
            return undefined;
        }
    }

    var styleSheetsExist = function () {
        return document.styleSheets;
    }
    var headElementExists = function () {
        return document.getElementsByTagName('head').length !== 0;
    }
    var makeStyleSheet = function () {
        var styleSheetElement = document.createElement('style');
        styleSheetElement.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(styleSheetElement);

        for (let i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].disabled) {
                continue;
            }
            styleSheet = makeMediaType(document.styleSheets[i]);
        }

    }
    var getStyleSheet = function () {
        if (document.styleSheets.length > 0) {
            for (var i = 0, l = document.styleSheets.length; i < l; i++) {
                if (document.styleSheets[i].disabled)
                    continue;

                styleSheet = makeMediaType(document.styleSheets[i]);

                if (typeof styleSheet !== 'undefined')
                    break;
            }
        }
    }
    var styleSheetDefined = function () {
        return styleSheet !== undefined;
    }

    pub.addRule = function (selector, style) {
        if (styleSheetDefined())
            styleSheet.addRule(selector, style);
    }

    pub.removeRule = function (selector) {
        if (styleSheetDefined())
            styleSheet.removeRule(selector);
    }
    constructor();
    return pub;
}
let cssClassBuilder = CSSClassBuilder();