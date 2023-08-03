import * as csv from '../utils/write_csv';
import * as stringUtils from '../utils/string';

// note, this is typically auto-added when writing to CSV 
const addQuotesAroundDelimEntries = false;

export class Location {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return ['name', 'altnames'];
    }
    /** Gets all the values in altnames, if any, in a string[] array 
     * @type {string[]} 
     * @see {@link AltNamesToArray} conveince getter for this.altnames*/
    get altNamesArray() {
        if (this.altnames !== null) {
            return this.AltNamesToArray(this.altnames);
        }
        return [];
    }

    /** Gets all the values in searchaltnames, if any, in a string[] array 
     * @type {string[]} 
     * @see {@link AltNamesToArray} conveince getter for this.searchaltnames*/
    get searchAltNamesArray() {
        if (this.searchaltnames != null) {
            return this.AltNamesToArray(this.searchaltnames);
        } else if (this.altnames != null) {
            let searchAltNames = this.altNamesArray;
            for (let i = 0; i < searchAltNames.length; i++) {
                searchAltNames[i] = searchAltNames[i].trim().toLocaleLowerCase();
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
                    for (let i = 0; i < entry.length; i++) {
                        entry[i]
                    }
                } else if (typeof value !== 'string') {
                    entry = entry.toString().trim();
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
    }

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
        return altNames.split(',');
    }

    /**
     * Applies the given array of altnames to this.altnames (or this.searchaltnames)
     * @param {string[]} altNamesArray Array of altnames to apply 
     * @param {boolean} search Apply as "searchaltnames"? Default false 
     */
    ApplyArrayToAltNamesString(altNamesArray, search = false) {
        if (altNamesArray == null) { return; }
        if (search) {
            for (let i = 0; i < altNamesArray.length; i++) {
                altNamesArray[i] = altNamesArray[i].trim().toLocaleLowerCase();
            }
        }
        let altNames = addQuotesAroundDelimEntries ?
            csv.delimQuote + altNamesArray.join(',') + csv.delimQuote :
            altNamesArray.join(',');
        if (search) {
            this['searchaltnames'] = altNames;
        } else {
            this['altnames'] = altNames;
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
                let writeReady = this[field] == null ||
                    typeof (this[field] === 'string') ? this[field].trim() == '' : this[field] == '';
                if (!writeReady && overwrite) {
                    // enable writeready UNLESS it's for altnames
                    // in that case, let the switch (field) handle it (we still just want to add those fields)
                    if (field != 'altnames' && field != 'searchaltnames') {
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
                    case 'name':
                        // check for searchname 
                        if (this['searchname'] == null) {
                            this['searchname'] = combine[field].trim().toLocaleLowerCase();
                        }
                        break;
                    case 'altnames':
                        // check for searchaltnames 
                        let currentAltNames = this.altNamesArray;
                        let newAltNames = combine.altNamesArray;
                        let searchAltNames = [];
                        // ensure searchaltnames exists 
                        if (this['searchaltnames'] == null) {
                            searchAltNames = currentAltNames;
                            for (let i = 0; i < searchAltNames.length; i++) {
                                searchAltNames[i] = searchAltNames[i].trim().toLocaleLowerCase();
                            }
                            // this['searchaltnames'] = searchAltNames;
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
                                searchAltNames.push(newAltName.trim().toLocaleLowerCase());
                            }
                        });
                        // if any new names were pushed, update the fields 
                        if (anyPushed) {
                            // direct apply
                            // this[field] = currentAltNames;
                            // this[('searchaltnames')] = searchAltNames;
                            // apply via method 
                            this.ApplyArrayToAltNamesString(currentAltNames, false);
                            this.ApplyArrayToAltNamesString(searchAltNames, true);
                        }
                        break;
                    case 'searchaltnames':
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
export class Continent extends Location {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return ['name', 'code', 'm49',
            'altnames', 'searchname', 'searchaltnames'];
    }
}
export class Country extends Location {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return ['name', 'continent', 'iso2', 'iso3', 'ccn', 'fips', 'cioc', 'latitude', 'longitude',
            'altnames', 'searchname', 'searchaltnames'];
    }
}
export class Region extends Location {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return ['name', 'continent', 'country', 'a1code', 'a2codes', 'latitude', 'longitude',
            'altnames', 'searchname', 'searchaltnames'];
    }
}
export class City extends Location {
    /** All fields (eg columns) for this location type
     * @type {string[]} */
    get dataFields() {
        return ['name', 'continent', 'country', 'a1code', 'a2code', 'latitude', 'longitude',
            'altnames', 'searchname', 'searchaltnames'];
    }
}