/** Grieger Triptychial */
export const grieger = 'grieger';
/** Adams Hemisphere-In-A-Square */
export const diptych = 'diptych';
/** Adams Hemisphere-In-A-Square (Atlantic) */
export const adams1 = 'adams1';
/** Adams Hemisphere-In-A-Square (Pacific) */
export const adams2 = 'adams2';
/** Grieger Triptychial (Alt) */
export const grieger_alt = 'grieger_alt';
/** Adams Hemisphere-In-A-Square (Atlantic) (Alt) */
export const adams1_alt = 'adams1_alt';
/** Adams Hemisphere-In-A-Square (Pacific) (Alt) */
export const adams2_alt = 'adams2_alt';
/** Peirce Quincuncial */
export const peirce = 'peirce';
/** Equirectangular */
export const equirectangular = 'equirectangular';
// Remember to update maps[] below as well!!!

/** 
 * 2D array holding all built-in map projection names. 
 * @example
 *      maps[i][0] // [0] is the full name of the map projection,
 *      maps[i][1] // [1] is const property of the name (top of maps.js),
 *      maps[i][2] // [2...] and beyond are alternate supported names
 * @see {@link GetMapD3GeoProjection}
 * @type {string[][]}
 */
const maps = [
    ['Grieger Triptychial',
        grieger, 'grieger triptychial', 'triptychial'],
    ['Grieger Triptychial (Alt)',
        grieger_alt, 'grieger triptychial', 'triptychial'],
    ['Adams HIAS Diptychial',
        diptych, 'grieger diptychial', 'adams diptychial', 'diptychial'],
    ['Peirce Quincuncial',
        peirce, 'pierce'],
    ['Adams Hemisphere-In-A-Square (Atlantic)',
        adams1, 'adams', 'adams atlantic'],
    ['Adams Hemisphere-In-A-Square (Pacific)',
        adams2, 'adams pacific'],
    ['Adams Hemisphere-In-A-Square (Atlantic) (Alt)',
        adams1_alt, 'adams', 'adams atlantic'],
    ['Adams Hemisphere-In-A-Square (Pacific) (Alt)',
        adams2_alt, 'adams pacific'],
    ['Equirectangular',
        equirectangular, 'geoequirectangular', 'geoequi', 'equirect']

    // Remember to update GetMapD3GeoProjection below as well!!!
];

import * as d3 from 'd3';
import * as d3gp from 'd3-geo-projection';

import * as math from './utils/math';

const useCSSTransformations = true;

/**
 * Get the {@link d3.GeoProjection} for this map
 * @param {string} map name of map projection you want
 * @returns {d3.GeoProjection}
 * @see {@link maps} for all valid map name inputs
 */
export function GetMapD3GeoProjection(map) {
    switch (ParseMap(map)) {
        default:
            console.warn("Unsupported projection type", map,
                ", can't get geoProjection, refer to maps.js, returning geoEquirectangular");
            return d3.geoEquirectangular();
        case equirectangular:
            return d3.geoEquirectangular();
        case peirce:
            return d3gp.geoPeirceQuincuncial();
        case adams1:
        case adams1_alt:
            return d3gp.geoPeirceQuincuncial();
        case adams2:
        case adams2_alt:
            return d3gp.geoPeirceQuincuncial();
    }
}

/**
 * Gets the full name of the given map (eg, supplying 'grieger' will return 'Grieger Triptychial')
 *
 * @param {string} map name of map projection you want
 * @return {string} full name of the map projection 
 * @see {@link maps} for all valid map name inputs
*/
export function GetMapFullName(map) {
    let id = GetMapID(map);
    if (id < 0) {
        console.error("ERROR: could not parse map " + map + ", invalid ID " + id + ", returning null");
        return null;
    }
    return maps[id][0];
}

export function GetMapScale(map) {
    switch (ParseMap(map)) {
        case adams1:
        case adams2:
            return math.sqrt2;
            // return math.sqrt2rec;
            return 1;
    }
    return 1;
}

export function GetMapContainerWidthHeight(map, mapSize, projectionsCount) {
    let containerWidthHeight = [mapSize, mapSize];
    switch (ParseMap(map)) {
        case grieger:
        case grieger_alt:
            containerWidthHeight[0] = mapSize * 2;
            break;
        default:
            containerWidthHeight[0] = mapSize * projectionsCount;
            break;
    }
    return containerWidthHeight;
}

export function GetMapCSSLeftOffset(map, mapSize, projectionIndex) {
    // left offset only ever applies on leftmost projection, eg index 0 
    if (projectionIndex != 0) { return 0; }
    switch (ParseMap(map)) {
        case grieger:
        case grieger_alt:
            return mapSize * -0.5;
    }
    return 0;
}
export function GetMapCSSRotation(map) {
    if (!useCSSTransformations) { return 0; }
    switch (ParseMap(map)) {
        case grieger:
        case grieger_alt:
            console.warn("Warning: this is meant for Projections, whereas", map,
                "is a map made of multiple individual projections");
            break;
        case adams1:
            return -45;
        case adams2:
            return 45;
        case adams1_alt:
        case adams2_alt:
            return 135;
    }
    return 0;
}
export function GetMapCSSTranslation(map, mapSize) {
    if (!useCSSTransformations) { return [0, 0]; }
    map = ParseMap(map);
    switch (map) {
        case adams1:
        case adams2:
            let mapSizeHalf = mapSize * 0.5;
            let mapMod = mapSize * 0.5 * -(math.sqrt2 - 1);
            switch (map) {
                case adams1: return [mapSizeHalf, mapMod];
                case adams2: return [mapMod, mapSizeHalf];
            }
        case adams1_alt:
        case adams2_alt:
            return [
                (mapSize * (math.sqrt2 - 1) * math.sqrt2rec),
                mapSize
            ];
    }
    return [0, 0];
}

/**
 * Convenience getter for map rotation. 
 * 
 * Technically the phi, or [1] from {@link GetProjectionFullRotation}. 
 * Useful, for example, for methods converting lat/long to pixel coordinates.
 * @param {string} map name of map projection you want
 * @returns {number} Rotation, in degrees, this projection should be displayed at
 * @see {@link maps} for all valid map name inputs
 */
export function GetProjectionRotation(map) {
    return GetProjectionFullRotation(map)[1];
}
/**
 * Get this map projection's rotation, [lambda,phi,gamma], for appropriate d3 geo display
 * @param {string} map name of the map projection you want
 * @returns {number[]} 3-value array representing this projection's rotation:
 * - rotation[lambda, phi, gamma]
 */
export function GetProjectionFullRotation(map) {
    let lambda = 0;
    let phi = 0;
    let gamma = 0;
    switch (ParseMap(map)) {
        case peirce:
            gamma = 315;
            break;
        case adams1:
            phi = 315;
            gamma = 225;
            break;
        case adams2:
            phi = 135;
            gamma = 225;
            break;
        case adams1_alt:
            // phi = 135;
            // gamma = 315;
            phi = 315;
            gamma = 45;
            break;
        case adams2_alt:
            phi = 135;
            gamma = 315;
            break;
    }
    return [lambda, phi, gamma];
}
let v = 0;

/**
 * Get the {@link d3.GeoProjection.center d3 center} for this map (lat, long)
 * @param {string} map name of map projection you want
 * @returns {number[]} Two-value array representing [latitude,longitude] of the center
 * @see {@link maps} for all valid map name inputs
 */
export function GetProjectionCenter(map) {
    switch (ParseMap(map)) {
        case adams1:
            return [0, 0];
        // return [45, 0];
        // return [0, 45];
        case adams2:
            return [0, 0];
        // return [180, -45];
        // return [-45, 180];
    }
    return [0, 0];
}

/**
 * Get the {@link d3.GeoProjection.clipAngle d3 clip angle} for this map
 * @param {string} map name of map projection you want
 * @returns {number} Clip angle value, in degrees
 * @see {@link maps} for all valid map name inputs
 */
export function GetMapProjectionClipAngle(map) {
    switch (ParseMap(map)) {
        case adams1:
        case adams2:
            return 90;
        case adams1_alt:
        case adams2_alt:
            return 90;
    }
    return 0;
}

/**
 * Get an array of projections for this map 
 * @param {string} map name of map projection you want
 * @returns {string[]} array of all projections involved in this map
 */
export function GetMapProjectionsArray(map) {
    switch (ParseMap(map)) {
        case grieger:
            return [adams2, adams1, adams2];
        case grieger_alt:
            return [adams2_alt, adams1_alt, adams2_alt];
        case diptych:
            return [adams2, adams1];
    }
    return [map];
}

/**
 * Gets the const reference name of the given map property (accommodating for alternate names). Returns null if not found.
 *
 * @param {string} map name of map projection you want
 * @return {string} map projection name, per const refs at top of maps.js
 * @example Eg, inputting "triptychial" returns {@link grieger [grieger]}
 * @see {@link maps} for all valid map name inputs
 */
export function ParseMap(map) {
    // quick check 
    maps.forEach(element => {
        if (element[1] == map) { return map; }
    });
    // id check 
    let id = GetMapID(map);
    if (id == -1) {
        console.error("Could not get map name by input name:", map, ", id -1, returning null");
        return null;
    }
    return maps[id][1];
}

/**
 * Gets the array index of the given map projection for const maps[][]. Returns -1 if not found
 *
 * @param {string} map name of map projection you want
 * @return {number} array index of the given map projection. Returns -1 if not found
 */
function GetMapID(map) {
    for (let i = 0; i < maps.length; i++) {
        // ensure entries valid 
        switch (maps[i].length) {
            case 0:
                console.error("ERROR: entry " + i + " in maps is empty, add values, skipping");
                continue;
            case 1:
                console.warn("ERROR: entry " + i + " in maps has only proper name " + maps[i][0] + ", add values, skipping");
                continue;
        }
        // first check direct names 
        if (maps[i][1] == map) {
            return i;
        }
    }
    // no direct matches, check alternate names 
    for (let i = 0; i < maps.length; i++) {
        // skip over entries just with the direct name 
        if (maps[i].length == 2) { continue; }
        for (let j = 2; j < maps[i].length; j++) {
            if (maps[i][j] == map) {
                // found it! 
                return i;
            }
        }
    }
    // no match 
    console.error("ERROR: could not find entry for map name " + map + ", could not get map ID, returning -1");
    return -1;
}

// sampling of mostly random, dubiously-accurate lat/long coordinates for testing 
//                            LOCATION    APPROX LAT,LONG     APPROX CURSOR POS*
export const EXAMPLE_LAT_LONG_VANCOUVER = [49.26, -123.11];//   259,113
export const EXAMPLE_LAT_LONG_AUSTRALIA = [-23.69, 135.1];//    409,213
export const EXAMPLE_LAT_LONG_MADAGASCAR = [-19.62, 47.17];//   244,275
export const EXAMPLE_LAT_LONG_RIO_BRAZIL = [-22.7, -42.9];//    161,199
export const EXAMPLE_LAT_LONG_FALKLAND_ISLES = [-51.79, -59.59];//  118,205
export const EXAMPLE_LAT_LONG_MCMURDO_STN = [-77.85, 166.666];//    63,172
export const EXAMPLE_LAT_LONG_GREENLAND = [73.45, -43.29];//    259,162
export const EXAMPLE_LAT_LONG_GULF_OF_MEXICO = [22.8, -93];//   210,114
export const EXAMPLE_LAT_LONG_GALAPAGOS = [-0.45, -91.12];//    130,112
export const EXAMPLE_LAT_LONG_INDIA = [19.13, 78.54];// 303,239
export const EXAMPLE_LAT_LONG_ITALY = [42.33, 12.84];// 250,200
export const EXAMPLE_LAT_LONG_HAWAII = [21, -155.75];// 420,122
// *: cursor pos is likely to change, it's based on js/css web test setup on june 29 2023
// *: also it's VERY approximate, even moreso than the lat/long. Values +/- 5-10px are expected


export const EXAMPLE_XY_VANCOUVER = [259, 113];
export const EXAMPLE_XY_AUSTRALIA = [409, 213];
export const EXAMPLE_XY_MADAGASCAR = [244, 275];
export const EXAMPLE_XY_RIO_BRAZIL = [161, 199];
export const EXAMPLE_XY_FALKLAND_ISLES = [118, 205];
export const EXAMPLE_XY_MCMURDO_STN = [63, 172];
export const EXAMPLE_XY_GREENLAND = [259, 162];
export const EXAMPLE_XY_GULF_OF_MEXICO = [210, 114];
export const EXAMPLE_XY_GALAPAGOS = [130, 112];
export const EXAMPLE_XY_INDIA = [303, 239];
export const EXAMPLE_XY_ITALY = [250, 200];
export const EXAMPLE_XY_HAWAII = [420, 122];