import { diceCoefficient } from "dice-coefficient";

const coeffBoundAccurate = 0.92;
const coeffBoundProbable = 0.7;

/**
 * Takes an input string, 
 * @param {string} inputString 
 * @returns {string} Matching term if found. Null if no reasonable match found (or invalid)
 */
export function GetTerm(inputString) {

    // nullcheck + trim + tolowercase
    if (inputString === null || typeof inputString !== 'string') { return null; }
    inputString = inputString.trim();
    if (inputString.length === 0) { return null; }
    inputString = inputString.toLowerCase();

    // first, quick check to see if it directly matches any terms 
    terms.forEach(term => {
        let termName = term[0];
        if (termName.toLowerCase() == inputString) { return termName; }
        term[1].forEach(plural => {
            if (plural == inputString) { return termName; }
        });
        term[2].forEach(altName => {
            if (altName == inputString) { return termName; }
        });
        term[3].forEach(typo => {
            if (typo == inputString) { return termName; }
        });
    });

    // no quick match found, use dice coefficient 
    let coeff = GetTermAndCoefficient(inputString);

    if (coeff.accuracy >= coeffBoundAccurate) {
        // found an accurate term, return it 
        return coeff.termName;
    }

    // check for delimiters
    if (delimiters.test(inputString)) {
        // at least one delimiter found - test as array 
        let results = [coeff];
        inputString.split(delimiters).forEach(splitString => {
            if (splitString === null ||
                typeof splitString !== 'string' ||
                splitString.trim().length === 0) {
                // empty/invalid value, do nothing 
            } else {
                // found delim values 
                results.push(GetTermAndCoefficient(splitString));
            }
        });
        // check if we actually got new values 
        if (results.length > 1) {
            // found multiple terms, sort by accuracy 
            // TODO: low-pri, filter results by accuracy (accurate/probable)
            results.sort((a, b) => b.accuracy - a.accuracy);
            if (results[0].accuracy >= coeffBoundProbable) {
                return results[0].termName;
            }
        } else {
            // didn't get new values after checking delims,
            // just return initial term if probably 
            if (coeff.accuracy >= coeffBoundProbable) {
                return coeff.termName;
            }
        }
    } else {
        // no delimiters found, return term if probable  
        if (coeff.accuracy >= coeffBoundProbable) {
            return coeff.termName;
        }
    }

    // could not find reasonably valid comparison, returning null 
    return null;

}

function GetTermAndCoefficient(inputString) {
    // assume inputString is valid/nonnull, per checks in GetTerm

    let mostAccurate = [
        {
            termName: null,
            accuracy: -1
        }
    ];

    // first, quick check to see if it directly matches any terms 
    terms.forEach(term => {


        // check direct name (note: diceCoefficient is case insensitive)
        let coefficient = diceCoefficient(term[0], inputString);

        // check plurals 
        // check common alt names 
        // check typos 

        let termName = term[0];
        if (termName.toLowerCase() == inputString) { return termName; }
        term[1].forEach(plural => {
            if (plural == inputString) { return termName; }
        });
        term[2].forEach(altName => {
            if (altName == inputString) { return termName; }
        });
        term[3].forEach(typo => {
            if (typo == inputString) { return termName; }
        });
    });

    // TODO: integrate n-grams for performance (see https://github.com/words/n-gram)

}

function CompareAccuracy(mostAccurate, newTerm, inputString) {
    let accuracy = diceCoefficient(newTerm, inputString);
    if (accuracy >= mostAccurate) {
        return accuracy;
    }
    return -1;
}


/**
 * Potential delimiters found in names of {@link terms} to search, using regex
 */
const delimiters = /[\s\-_,.;+\/\\]+/;

/**
 * Common terms found in data spreadsheets, typically column names 
 * @example terms[a][x]
 *  - a: term index, iterate through for all terms  
 *  - x = 0: string, name of the term, eg "Latitude"
 *  (Note that x[0] is NOT lowercase, and for comparison, should be made so)
 *  - x = 1: string[], plural/adjectives for term, eg "[latitudinal]"
 *  - x = 2: string[], common alt names for term, eg "[lat, lt]"
 *  - x = 3: string[], common typos for term, eg ["lattitude"]
 * @see {@link delimiters}
 */
const terms = [

    ['Latitude',
        // plural/adjectives
        [
            'latitudes', 'latitudinal'
        ],
        // common alt names 
        [
            'la', 'lat', 'lats', 'lt', 'ltd', 'lttd',
        ],
        // common typos 
        [
            'lattitude', 'latitute', 'latidude', 'latittude',
            'lattittude', 'latitudal',
        ]],

    ['Longitude',
        // plural/adjectives
        [
            'longitudes', 'longitudinal'
        ],
        // common alt names 
        [
            'lo', 'ln', 'lg', 'lon', 'lng', 'long', 'lngt', 'lngd',
            'lngtd', 'longi', 'longtd', 'lgt', 'lgtd', 'lgd',
            'longitudinal'
        ],
        // common typos 
        [
            'longitute', 'longidude', 'longittude', 'longitudal'
        ]],

    ['Coordinate',
        // plural/adjectives
        [
            'coordinates', 'coords',
            'co-ordinates', 'co-ords',
            'co_ordinates', 'co_ords',
        ],
        // common alt names 
        [
            'coord', 'crds', 'cds',
            'co-ord', 'co-ordinate',
            'co_ord', 'co_ordinate',
        ],
        // common typos 
        [
            'cordinate', 'cordinates', 'coordanate', 'coordanats',
            'coordinats', 'cords', 'ordinates'
        ]],

    ['GeoPoint',
        // plural/adjectives
        [
            'geopoints', 'gpts'
        ],
        // common alt names 
        [
            // note: we don't want to directly search for "point"
            // as that'll often be used for other things in datasets. 
            // the "geo" prefix is important
            'geopt', 'gpt', 'geo point', 'geo-point', 'geo_point'
        ],
        // common typos 
        [
            'geopont', 'gpoint', 'geopint', 'gopoint', 'gopint'
        ]],

    ['Continent',
        // plural/adjectives
        [
            'continents'
        ],
        // common alt names 
        [
            'cont', 'conts', 'cnts'
        ],
        // common typos 
        [
            'continant', 'continants', 'contenant', 'contenint'
        ]],

    ['Country',
        // plural/adjectives
        [
            'countries'
        ],
        // common alt names 
        [
            'cntr', 'ctry', 'co'
        ],
        // common typos 
        [
            'countrys', 'contry', 'cuntry', 'contries', 'countreis'
        ]],

    ['Region',
        // plural/adjectives
        [
            'regions', 'states', 'provinces', 'prefectures', 'territories',
            'districts', 'divisions', 'divs'
        ],
        // common alt names 
        [
            'state', 'province', 'prov', 'prv', 'administrative', 'admin',
            'prefecture', 'pref', 'territory', 'district', 'division', 'div'
        ],
        // common typos 
        [
            'regin', 'provinse', 'prv', 'prefecshure',
            'teritory', 'territtory', 'terittory'
        ]],

    ['City',
        // plural/adjectives
        [
            'cities', 'town', 'municipalities'
        ],
        // common alt names 
        [
            'town', 'municipality', 'municipal', 'capital',
            'metropolis', 'settlement', 'place', 'location', 'locale'
        ],
        // common typos 
        [
            'citys', 'citi', 'towne', 'citie'
        ]],

];


// terms to identify:
// latitude
// longitude
// coordinate
// geopoint
// continent
// country
// region
// city