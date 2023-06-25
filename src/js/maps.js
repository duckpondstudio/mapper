export const grieger = 'grieger';
export const adams1 = 'adams1';
export const adams2 = 'adams2';
export const peirce = 'peirce';
export const equirectangular = 'equirectangular';

/** 
 * @type {string[][]} 2D array holding all built-in map projection names. 
 * @example
 *      maps[i][0] // [0] is the full name of the map projection,
 *      maps[i][1] // [1] is const property of the name (top of maps.js),
 *      maps[i][2] // [2...] and beyond are alternate supported names
 * 
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