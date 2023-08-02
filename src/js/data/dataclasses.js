import * as csv from '../utils/write_csv';
import * as stringUtils from '../utils/string';

export class Location {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return ['name', 'altnames'];
    }
    /** Gets all the values in altnames, if any, in a string[] array 
     * @type {string[]} */
    get altNamesArray() {
        if (this.altnames !== null) {
            return this.AltNamesArray(this.altnames);
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
                    for (let i = 0; i < entry.length; i++) {
                        entry[i]
                    }
                } else if (typeof value !== 'string') {
                    entry = entry.toString().trim();
                    if (entry.indexOf(delimiter) >= 0)
                        entry = stringUtils.SurroundString(entry, csv.delimQuote);
                }
                if (entry.indexOf(delimiter) >= 0) {
                    if (!entry.startsWith(csv.delimQuote)) { entry = csv.delimQuote + entry; }
                    if (!entry.endsWith(csv.delimQuote)) { entry = entry + csv.delimQuote; }
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
            this[this.dataFields[i]] =
                data != null && data.length >= i + 1 ?
                    data[i] : null;
        }
    }

    static AltNamesToArray(altNames) {
        if (altNames === null) { return []; }
        if (Array.isArray(altNames)) { return altNames; }
        if (altNames.indexOf('"') == 0) {
            altNames = altNames.slice(1);
        }
        if (altNames.indexOf('[') == 0) {
            altNames = altNames.slice(1);
        }
        if (altNames.lastIndexOf('"') == altNames.length - 1) {
            altNames = altNames.slice(0, altNames.length - 1);
        }
        if (altNames.lastIndexOf(']') == altNames.length - 1) {
            altNames = altNames.slice(0, altNames.length - 1);
        }
        return altNames.split(',');
    }

    /**
     * Combine data from the given Location into this one 
     * @param {Location} combine Location who's data to add into this one 
     */
    AddData(combine) {
        this.dataFields.forEach(field => {
            if (field == 'altnames') {
                if (combine.altnames !== null) {
                    let currentAltNames = this.altNamesArray;
                    let newAltNames = this.AltNamesToArray(combine.altnames);
                    let anyPushed = false;
                    newAltNames.forEach(newAltName => {
                        if (!currentAltNames.includes(newAltName)) {
                            currentAltNames.push(newAltName);
                            anyPushed = true;
                        }
                    });
                    if (anyPushed) {
                        this[field] = currentAltNames;
                        // update searchaltnames 
                        let newSearchAltNames = [];
                        currentAltNames.forEach(altName => {
                            newSearchAltNames.push(altName.toLocaleLowerCase());
                        });
                        this[('search' + field)] = newSearchAltNames;
                    }
                }
            } else {
                if (this[field] === null && combine[field] !== null) {
                    this[field] = combine[field];
                }
            }
        });
    }
}
export class Continent extends Location {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return ['name', 'code', 'm49', 'altnames'];
    }
}
export class Country extends Location {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return ['name', 'continent', 'iso2', 'iso3', 'ccn', 'fips', 'cioc', 'latitude', 'longitude', 'altnames'];
    }
}
export class Region extends Location {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return ['name', 'continent', 'country', 'a1code', 'a2codes', 'latitude', 'longitude', 'altnames'];
    }
}
export class City extends Location {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return ['name', 'continent', 'country', 'a1code', 'a2code', 'latitude', 'longitude', 'altnames'];
    }
}