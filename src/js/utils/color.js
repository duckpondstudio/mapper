// see: https://github.com/bpostlethwaite/colormap
import * as colormap from 'colormap';
import { css } from '../base/css';
import * as LC from '@sunify/lerp-color';

// -------------------- //
// ---  COLOR MATH  --- //
// -------------------- //

export const LerpColor = function (from, to, ratio) {
    return LC.default(from, to, ratio);
};

export function RGBAToHexA(rgba, forceRemoveAlpha = true) {
    // credit: https://stackoverflow.com/questions/49974145/how-to-convert-rgba-to-hex-color-code-using-javascript
    return "#" + rgba.replace(/^rgba?\(|\s+|\)$/g, '') // Get's rgba / rgb string values
        .split(',') // splits them at ","
        .filter((string, index) => !forceRemoveAlpha || index !== 3)
        .map(string => parseFloat(string)) // Converts them to numbers
        .map((number, index) => index === 3 ? Math.round(number * 255) : number) // Converts alpha to 255 number
        .map(number => number.toString(16)) // Converts numbers to hex
        .map(string => string.length === 1 ? "0" + string : string) // Adds 0 when length of one number is 1
        .join("") // Puts the array to togehter to a string
}


// --------------------- //
// --- SINGLE COLORS --- //
// --------------------- //

export const singlecolors = {
    land: '--color-map-land-fill',
    water: '--color-map-water-fill',
    white: '#FFFFFF',
    black: '#000000',
    error: '#FF00FF',
    earthgreen: '#A4ECB4',
    earthwater: '#BCFFFF',
    cautionyellow: '#F9D82E',
    darkgray: '#201F21',
}


// --------------------- //
// ---  COLOR PAIRS  --- //
// --------------------- //

export const colorpairs = {
    default: ['land', 'water'],
    earth: ['earthgreen', 'earthwater'],
    bw: ['black', 'white'],
    bw_inv: ['white', 'black'],
    caution: ['cautionyellow', 'darkgray'],
}
// note - be careful not to use duplicate names with any gradients, which may confuse the IsGradient check

export function AllColorPairs(includeSeparator = false) {
    let pairs = [];
    for (let cp in colorpairs) {
        if (includeSeparator && cp != 'default') {
            pairs.push('--Color Pairs');
            includeSeparator = false;
        }
        pairs.push(cp);
    };
    return pairs;
}

export function GetColorPair(colorPairName, formatToColors = false) {
    for (let cp in colorpairs) {
        if (cp == colorPairName) {
            if (formatToColors) {
                return [GetColor(colorpairs[cp][0]), GetColor(colorpairs[cp][1])];
            }
            return colorpairs[cp];
        }
    }
    console.warn("Could not find ColorPair of name: " + colorPairName + ", returning null");
    return null;
}


// --------------------- //
// ---   GRADIENTS   --- //
// --------------------- //

export const gradients_singleaxis = {
    spring: 'spring',
    summer: 'summer',
    autumn: 'autumn',
    winter: 'winter',
    bone: 'bone',
    copper: 'copper',
    greys: 'greys',
    greens: 'greens',
    YlGnBu: 'YlGnBu',
    YlOrRed: 'YlOrRed',
}
export const gradients_twoaxis = {
    picnic: 'picnic',
    portland: 'portland',
    bluered: 'bluered',
    RdBu: 'RdBu',
    virdis: 'virdis',
    plasma: 'plasma',
}
export const gradients_utility = {
    earth: 'earth',
    electric: 'electric',
    hot: 'hot',
    warm: 'warm',
    cool: 'cool',
    bathymetry: 'bathymetry',
    cdom: 'cdom',
    chlorophyll: 'chlorophyll',
    density: 'density',
    freesurface_blue: 'freesurface-blue',
    freesurface_red: 'freesurface-red',
    oxygen: 'oxygen',
    par: 'par',
    phase: 'phase',
    salinity: 'salinity',
    temperature: 'temperature',
    turbidity: 'turbidity',
    velocity_blue: 'velocity-blue',
    velocity_green: 'velocity-green',
}
export const gradients_aesthetic = {
    blackbody: 'blackbody',
    inferno: 'inferno',
    magma: 'magma',
    cubehelix: 'cubehelix',
    jet: 'jet',
    hsv: 'hsv',
    rainbow: 'rainbow',
    rainbow_soft: 'rainbow-soft',
}

export function AllGradients(includeTypeNames = false) {
    let gradients = [];
    gradients.push(...GradientsOfType('singleaxis', includeTypeNames));
    gradients.push(...GradientsOfType('twoaxis', includeTypeNames));
    gradients.push(...GradientsOfType('utility', includeTypeNames));
    gradients.push(...GradientsOfType('aesthetic', includeTypeNames));
    return gradients;
}
export function GradientsOfType(type, includeTypeNames = false) {
    let gradients = [];
    switch (type) {
        case 'singleaxis':
            if (includeTypeNames) { gradients.push('--Single Axis'); }
            for (let g in gradients_singleaxis) {
                gradients.push(g);
            };
            break;
        case 'twoaxis':
            if (includeTypeNames) { gradients.push('--Two Axis'); }
            for (let g in gradients_twoaxis) {
                gradients.push(g);
            };
            break;
        case 'utility':
            if (includeTypeNames) { gradients.push('--Utility'); }
            for (let g in gradients_utility) {
                gradients.push(g);
            };
            break;
        case 'aesthetic':
            if (includeTypeNames) { gradients.push('--Aesthetic'); }
            for (let g in gradients_aesthetic) {
                gradients.push(g);
            };
            break;
        default:
            console.warn('Invalid gradient type " + type + ", must be "singleaxis", "twoaxis", "utility", or "aesthetic"');
            break;
    }
    return gradients;
}

/**
 * Checks if the given name is, in fact, a valid gradient
 * @param {string} gradient Gradient name to check
 * @param {string} ofType Gradient type, 'singleaxis', 'twoaxis', 'utility', or 'aesthetic'. If null checks all. 
 * @returns {boolean}
 */
export function IsGradient(gradient, ofType = null) {
    let gradients = ofType != null ? GradientsOfType(ofType) : AllGradients();
    for (let i in gradients) {
        if (gradient == gradients[i]) { return true; }
    }
    return false;
}

const gradient_default = gradients_singleaxis.spring;
let gradient_recent;

export function Gradient(gradientName, reverse = false, shades = shadesDefault) {

    if (gradientName == null) {
        if (gradient_recent == null) {
            gradientName = gradient_default;
        }
    }
    gradient_recent = gradientName;

    let gradient = GetColorMap(gradientName, shades);

    return reverse ? gradient.reverse() : gradient;
}

export function GradientPercent(gradientName, per, reverse = false, shades = shadesArray) {
    let i = Math.round(per * 100);
    let gradient = Gradient(gradientName, reverse, shades);
    return gradient[i];
}

export function GradientCSS(gradientName,
    cssParams = {
        gradient_style: 'linear-gradient',
        gradient_orientation: '90deg',
    },
    reverse = false, shades = shadesCSS) {

    let gradient = Gradient(gradientName, reverse, shades);
    let css = cssParams.gradient_style +
        '(' + cssParams.gradient_orientation;

    gradient.forEach(color => {
        css += ',' + color;
    });
    css += ')';

    return css;
}

/**
 * Parse a color by name reference or value.
 * @param {string} colorName Name of the color. Must correspond to a name 
 * found in {@link singlecolors}, or be a hex code color ("#AABBCC" or "0xAABBCC"), 
 * or be a CSS variable reference ("--my-css-color").
 * @see {@link singlecolors} 
 * @returns {string} string hex color in the format "#AABBCC"
 */
export function GetColor(colorName) {
    if (colorName == null) {
        console.warn("Can't get null color, returning #000000");
    }
    if (typeof (colorName) == 'string') {
        if (colorName.startsWith('0x')) {
            return '#' + colorName.substring(2);
        } else if (colorName.startsWith('#')) {
            return colorName;
        } else if (colorName.startsWith('rgb')) {
            return RGBAToHexA(colorName);
        }
    } else {
        return colorName;
    }
    for (let c in singlecolors) {
        if (c == colorName) {
            if (singlecolors[c].startsWith('--')) {
                return css.getPropertyValue(singlecolors[c]);
            } else if (singlecolors[c].startsWith('0x')) {
                return '#' + singlecolors[c].substring(2);
            }
            return singlecolors[c];
        }
    };
    console.warn("Invalid colorName. Could not parse, or " +
        "find single color of colorName: " + colorName +
        ", returning #FF00FF");
    return '#FF00FF';
}

/** store local ref to loaded {@link colormap colormaps} */
let loadedColorMaps = {};

function GetColorMap(gradientName, shades) {
    // TODO: if loading a LOT, unload least recently used ones 
    let id = gradientName + '_' + shades;
    if (loadedColorMaps.hasOwnProperty(id)) {
        return loadedColorMaps[id];
    }
    let gradient = colormap({
        colormap: gradientName,
        nshades: shades
    });
    loadedColorMaps[id] = gradient;
    return gradient;
}



/**
 * Number of hex codes to load into CSS gradient. 
 * As of July 2023, the min number is "16", required by "cubehelix"
 */
const shadesMin = 16;
const shadesDefault = 32;
const shadesArray = 100;
const shadesCSS = shadesMin;