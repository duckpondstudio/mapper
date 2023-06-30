export const grieger = 'grieger';
export const adams1 = 'adams1';
export const adams2 = 'adams2';
export const peirce = 'peirce';
export const equirectangular = 'equirectangular';

import * as d3 from 'd3';
import * as d3gp from 'd3-geo-projection';

import * as math from './utils/math';

/** 
 * @type {string[][]} 2D array holding all built-in map projection names. 
 * @example
 *      maps[i][0] // [0] is the full name of the map projection,
 *      maps[i][1] // [1] is const property of the name (top of maps.js),
 *      maps[i][2] // [2...] and beyond are alternate supported names
 */
const maps = [
    ['Grieger Triptychial',
        grieger, 'grieger triptychial', 'triptychial'],
    ['Peirce Quincuncial ',
        peirce, 'pierce'],
    ['Adams Hemisphere-In-A-Square (Atlantic)',
        adams1, 'adams', 'adams atlantic'],
    ['Adams Hemisphere-In-A-Square (Pacific)',
        adams2, 'adams pacific'],
    ['Equirectangular',
        equirectangular, 'geoequirectangular', 'geoequi', 'equirect']
];

/**
 * Gets the const reference name of the given map property (accommodating for alternate names). Returns null if not found.
 *
 * @param {string} map name of map projection you want
 * @return {string} map projection name, per const refs at top of maps.js
 * @see {@link maps} for all valid map name inputs
 */
export function ParseMap(map) {
    let id = GetMapID(map);
    if (id < 0) {
        console.error("ERROR: could not parse map " + map + ", invalid ID " + id + ", returning null");
        return null;
    }
    return maps[id][1];
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

/**
 * Get the {@link d3.GeoProjection} for this map
 * @param {string} map name of map projection you want
 * @returns {d3.GeoProjection}
 * @see {@link maps} for all valid map name inputs
 */
export function GetMapD3GeoProjection(map) {
    switch (map) {
        default:
            console.warn("Unsupported projection type", map,
                ", can't get geoProjection, refer to maps.js, returning geoEquirectangular");
            return d3.geoEquirectangular();
        case equirectangular:
            return d3.geoEquirectangular();
        case peirce:
            return d3gp.geoPeirceQuincuncial();
        case adams1:
            return d3gp.geoPeirceQuincuncial();
        case adams2:
            return d3gp.geoPeirceQuincuncial();
    }
}

export function GetMapCSSRotation(map) {
    switch (map) {
        case adams1:
        case adams2:
            return 135;
    }
    return 0;
}
export function GetMapCSSTranslation(map, mapSize) {
    switch (map) {
        case adams1:
        case adams2:
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
    switch (map) {
        case peirce:
            gamma = 315;
            break;
        case adams1:
            // phi = 135;
            // gamma = 315;
            phi = 315;
            gamma = 45;
            break;
        case adams2:
            phi = 135;
            gamma = 315;
            break;
    }
    return [lambda, phi, gamma];
}

/**
 * Get the {@link d3.GeoProjection.clipAngle d3 clip angle} for this map
 * @param {string} map name of map projection you want
 * @returns {number} Clip angle value, in degrees
 * @see {@link maps} for all valid map name inputs
 */
export function GetMapProjectionClipAngle(map) {
    switch (map) {
        case adams1:
        case adams2:
            return 90;
    }
    return 0;
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
export const EXAMPLE_LAT_LONG_VANCOUVER = [49.26, -123.11];
export const EXAMPLE_LAT_LONG_AUSTRALIA = [-23.69, 135.1];
export const EXAMPLE_LAT_LONG_MADAGASCAR = [-19.62, 47.17];
export const EXAMPLE_LAT_LONG_RIO_BRAZIL = [-22.83, -43.17];
export const EXAMPLE_LAT_LONG_FALKLAND_ISLES = [-51.79, -59.59];
export const EXAMPLE_LAT_LONG_MCMURDO_STN = [-77.85, 166.666];
export const EXAMPLE_LAT_LONG_GREENLAND = [73.45, -43.29];
export const EXAMPLE_LAT_LONG_GULF_OF_MEXICO = [22.8, -93];
export const EXAMPLE_LAT_LONG_GALAPAGOS = [-0.45, -91.12];
export const EXAMPLE_LAT_LONG_INDIA = [19.13, 78.54];
export const EXAMPLE_LAT_LONG_ITALY = [42.33, 12.84];
export const EXAMPLE_LAT_LONG_HAWAII = [21, -155.75];