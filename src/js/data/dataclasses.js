import * as csv from '../utils/write_csv';
import * as stringUtils from '../utils/string';

// note, this is typically auto-added when writing to CSV 
const addQuotesAroundDelimEntries = false;

export const name = 'name';
export const altnames = 'altnames';
export const searchname = 'searchname';
export const searchaltnames = 'searchaltnames';

export const type_Default = 'default';
export const type_Continent = 'continent';
export const type_Country = 'country';
export const type_Region = 'region';
export const type_City = 'city';

export const dataFields_Default =
    [name, altnames, searchname, searchaltnames];
export const dataFields_Continent = dataFields_Default.concat(
    ['code', 'm49']);
export const dataFields_Country = dataFields_Default.concat(
    ['continent', 'iso2', 'iso3', 'ccn', 'fips', 'cioc', 'latitude', 'longitude']);
export const dataFields_Region = dataFields_Default.concat(
    ['continent', 'country', 'a1code', 'a2codes', 'latitude', 'longitude']);
export const dataFields_City = dataFields_Default.concat(
    ['continent', 'country', 'a1code', 'a2code', 'latitude', 'longitude']);

/**
 * Gets the DataFields associated with the given location type 
 * @param {string} locationType Location type, see {@link type_Default}
 * @returns {string[]} DataFields for the given Location type, see {@link dataFields_Default}
 */
export function GetDataFields(locationType) {
    switch (locationType) {
        case type_Continent:
            return dataFields_Continent;
        case type_Country:
            return dataFields_Country;
        case type_Region:
            return dataFields_Region;
        case type_City:
            return dataFields_City;
        default:
            console.warn("Invalid type", locationType, ", cannot get DataFields, returning dataFields_Default");
        case type_Default:
            return dataFields_Default;
    }
}

export class Location {

    /** 
     * flag set by {@link './dataContainer.js'} 
     * 
     * note: just for performance, be careful not to override
    */
    addedToContainer = false;

    /** Type of this Location, eg "continent", or "default" @type {string} */
    get type() { return type_Default; }
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return [name, altnames, searchname, searchaltnames];
    }
    /** Gets all the values in altnames, if any, in a string[] array 
     * @type {string[]} 
     * @see {@link AltNamesToArray} conveince getter for this.altnames*/
    get altNamesArray() {
        if (this.altnames !== null) {
            return Location.AltNamesToArray(this.altnames);
        }
        return [];
    }

    /** Gets the data itself, as matching the {@link dataFields} array. */
    get dataValues() {
        let values = [];
        for (let i = 0; i < this.dataFields.length; i++) {
            values[i] = this[this.dataFields[i]];
        }
        return values;
    }

    /** Gets all the values in searchaltnames, if any, in a string[] array 
     * @type {string[]} 
     * @see {@link AltNamesToArray} conveince getter for this.searchaltnames*/
    get searchAltNamesArray() {
        if (this.searchaltnames != null) {
            return Location.AltNamesToArray(this.searchaltnames);
        } else if (this.altnames != null) {
            let searchAltNames = this.altNamesArray;
            for (let i = 0; i < searchAltNames.length; i++) {
                searchAltNames[i] = stringUtils.Simplify(searchAltNames[i]);
            }
            this.ApplyArrayToAltNamesString(searchAltNames, true);
            return searchAltNames;
        }
        return [];
    }

    get row() {
        return this.ParseDataAsRow(csv.defaultDelim, true);
    }
    ParseDataAsRow(delimiter = csv.defaultDelim, includeNullValues = true, returnFullyNullRows = false) {
        let row = [];
        this.dataFields.forEach(field => {
            let entry = this[field];
            if (entry == null) {
                // ignore, null  
                if (includeNullValues) {
                    row.push('');
                }
            } else {
                if (Array.isArray(entry)) {
                    entry = entry.join(delimiter);
                } else if (typeof value != 'string') {
                    entry = entry.toString();
                }
                entry = entry.trim();
                if (addQuotesAroundDelimEntries && entry.indexOf(delimiter) >= 0) {
                    entry = stringUtils.SurroundString(entry, csv.delimQuote);
                }
                row.push(entry);
            }
        });
        if (!returnFullyNullRows) {
            let foundNonNullEntry = false;
            for (let i = 0; i < row.length; i++) {
                if (row[i] !== null) {
                    foundNonNullEntry = true;
                    break;
                }
            }
            if (!foundNonNullEntry) {
                return null;
            }
        }
        return row;
    }

    constructor(...data) {
        for (let i = 0; i < this.dataFields.length; i++) {
            let value;
            if (data != null && data.length >= i + 1 && data[i] !== null) {
                value = data[i];
                if (typeof value === 'string') {
                    value = value.trim();
                    if (addQuotesAroundDelimEntries) {
                        if (value.indexOf(csv.defaultDelim >= 0)) {
                            value = stringUtils.SurroundString(
                                value, csv.delimQuote);
                        }
                    }
                }
            } else {
                value = null;
            }
            this[this.dataFields[i]] = value;
        }
        // check searchname and searchaltnames
        if ((this[searchname] == null || this[searchname] == '') &&
            this.name != null) {
            this[searchname] = stringUtils.Simplify(this.name);
        }
        if ((this[searchaltnames] == null ||
            this[searchaltnames] == '' ||
            (Array.isArray(this[searchaltnames]) &&
                this[searchaltnames].length == 0)) &&
            this.altnames != null) {
            let searchAltNamesArray = Location.AltNamesToArray(this.altnames);
            this.ApplyArrayToAltNamesString(searchAltNamesArray, true);
        }
    }

    /**
     * Input altnames either as an array or string, output as array
     * @param {string|string[]} altNames 
     * @returns string[]
     */
    static AltNamesToArray(altNames) {
        if (altNames == null) { return []; }
        if (Array.isArray(altNames)) { return altNames; }
        altNames = altNames.trim();
        if (altNames.indexOf(csv.delimQuote) == 0) {
            altNames = altNames.slice(1);
        }
        if (altNames.indexOf('[') == 0) {
            altNames = altNames.slice(1);
        }
        if (altNames.lastIndexOf(csv.delimQuote) == altNames.length - 1) {
            altNames = altNames.slice(0, altNames.length - 1);
        }
        if (altNames.lastIndexOf(']') == altNames.length - 1) {
            altNames = altNames.slice(0, altNames.length - 1);
        }
        return altNames.split(csv.defaultDelim);
    }

    /**
     * Applies the given array of altnames to this.altnames (or this.searchaltnames)
     * @param {string[]} altNamesArray Array of altnames to apply 
     * @param {boolean} search Apply as "searchaltnames"? Default false 
     */
    ApplyArrayToAltNamesString(altNamesArray, search = false) {
        if (altNamesArray == null) { return; }
        let updatedAltNamesArray = [];
        if (search) {
            for (let i = 0; i < altNamesArray.length; i++) {
                let newAltName = stringUtils.Simplify(altNamesArray[i]);
                if (!updatedAltNamesArray.includes(newAltName)) {
                    updatedAltNamesArray.push(newAltName);
                }
            }
        }
        let altNames = addQuotesAroundDelimEntries ?
            csv.delimQuote + altNamesArray.join(',') + csv.delimQuote :
            altNamesArray.join(',');
        if (search) {
            console.log("ADDING:", updatedAltNamesArray);
            this[searchaltnames] = updatedAltNamesArray;
            console.log("value:", this[searchaltnames]);
        } else {
            this[altnames] = altNames;
        }
    }

    /**
     * Combine data from the given Location into this one 
     * @param {Location} combine Location who's data to add into this one 
     * @param {boolean} [overwrite=false] Overwrite existing values? Default false 
     */
    AddData(combine, overwrite = false) {
        this.dataFields.forEach(field => {
            // check if combine field exists 
            if (combine[field] != null) {
                // check current field value 
                let writeReady = this[field] == null;
                if (!writeReady && typeof this[field] === 'string') {
                    writeReady = stringUtils.IsNullOrEmptyOrWhitespace(this[field]);
                }
                if (!writeReady && overwrite) {
                    // enable writeready UNLESS it's for altnames
                    // in that case, let the switch (field) handle it (we still just want to add those fields)
                    if (field != altnames && field != searchaltnames) {
                        writeReady = true;
                    }
                }
                if (writeReady) {
                    // current field does not exist, is empty, or is undefined, simply add it 
                    this[field] = combine[field];
                } else {
                    // current field exists, ignore 
                }
                // extra functionality for specific fields 
                switch (field) {
                    case name:
                        // check for searchname 
                        if (this[searchname] == null) {
                            this[searchname] = stringUtils.Simplify(combine[field]);
                        }
                        break;
                    case altnames:
                        // check for searchaltnames 
                        let currentAltNames = this.altNamesArray;
                        let newAltNames = combine.altNamesArray;
                        let searchAltNames = [];
                        // ensure searchaltnames exists 
                        if (this[searchaltnames] == null) {
                            searchAltNames = currentAltNames;
                            for (let i = 0; i < searchAltNames.length; i++) {
                                searchAltNames[i] = stringUtils.Simplify(searchAltNames[i]);
                            }
                            // this[searchaltnames] = searchAltNames;
                            this.ApplyArrayToAltNamesString(searchAltNames, true);
                        }
                        // update with new alt names 
                        let anyPushed = false;
                        newAltNames.forEach(newAltName => {
                            if (!currentAltNames.includes(newAltName)) {
                                anyPushed = true;
                                // update current alt names 
                                currentAltNames.push(newAltName);
                                // add new altname to searchaltnames 
                                searchAltNames.push(stringUtils.Simplify(newAltName));
                            }
                        });
                        // if any new names were pushed, update the fields 
                        if (anyPushed) {
                            // direct apply
                            // this[field] = currentAltNames;
                            // this[(searchaltnames)] = searchAltNames;
                            // apply via method 
                            this.ApplyArrayToAltNamesString(currentAltNames, false);
                            this.ApplyArrayToAltNamesString(searchAltNames, true);
                        }
                        break;
                    case searchaltnames:
                        // just add if not already existing 
                        let currentSearchAltNames = this.searchAltNamesArray;
                        let newSearchAltNames = combine.searchAltNamesArray;
                        newSearchAltNames.forEach(newSearchAltName => {
                            if (!currentSearchAltNames.includes(newSearchAltName)) {
                                currentSearchAltNames.push(newSearchAltName);
                            }
                        });
                        this.ApplyArrayToAltNamesString(currentSearchAltNames, true);
                        break;
                }
            }
        });
    }
}


/**
 * Is the given LocationType a valid location type?
 * 
 * See {@link type_Continent}, {@link type_Country}, 
 * {@link type_Region}, and {@link type_City}.
 * 
 * Returns true with a warning if checking {@link type_Default}
 * @param {string} locationType 
 * @returns {boolean}
 */
export function IsValidLocationType(locationType) {
    switch (locationType) {
        case type_Continent:
        case type_Country:
        case type_Region:
        case type_City:
            return true;
        case type_Default:
            console.warn('While type_Default IS a valid location type, ',
                'it should not generally be used. Returning true with warning.');
            return true;
    }
    return false;
}


export class Continent extends Location {
    /** Type of this Location, eg "continent" @type {string} */
    get type() { return type_Continent; }
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return dataFields_Continent;
    }
}
export class Country extends Location {
    /** Type of this Location, eg "country" @type {string} */
    get type() { return type_Country; }
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return dataFields_Country;
    }
}
export class Region extends Location {
    /** Type of this Location, eg "region" @type {string} */
    get type() { return type_Region; }
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return dataFields_Region;
    }
}
export class City extends Location {
    /** Type of this Location, eg "city" @type {string} */
    get type() { return type_City; }
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return dataFields_City;
    }
}