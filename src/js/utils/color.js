// see: https://github.com/bpostlethwaite/colormap
import * as colormap from 'colormap';

export const gradients_types = {
    singleaxis: 'gradients_singleaxis',
    twoaxis: 'gradients_twoaxis',
    utility: 'gradients_utility',
    aesthetic: 'gradients_aesthetic',
}

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
    temperare: 'temperare',
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