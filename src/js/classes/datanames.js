import { diceCoefficient } from "dice-coefficient";

const coeffBoundAccurate = 0.92;
const coeffBoundProbable = 0.6;

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

    let mostAccurate = {
        accuracy: coeffBoundProbable,
        termIDs: []
    };

    // TODO: integrate n-grams for performance (see https://github.com/words/n-gram)

    // iterate over all terms and check for accuracy 
    terms.forEach(term => {

        let termName = term[0];

        // check direct name (note: diceCoefficient is case insensitive)
        mostAccurate = UpdateTermsAccuracy(mostAccurate, termName, termName, inputString);

        // check plurals 
        term[1].forEach(plural => {
            mostAccurate = UpdateTermsAccuracy(mostAccurate, plural, termName, inputString);
        });

        // check common alt names 
        term[2].forEach(altName => {
            mostAccurate = UpdateTermsAccuracy(mostAccurate, altName, termName, inputString);
        });

        // check typos 
        term[3].forEach(typo => {
            mostAccurate = UpdateTermsAccuracy(mostAccurate, typo, termName, inputString);
        });
    });

    // done iterating over terms! check for duplicate terms 
    if (mostAccurate.termIDs.length > 1) {
        // multiple term IDs found, check if there are any different termNames 
        let allTerms = {};
        mostAccurate.termIDs.forEach(termID => {
            // increment terms 
            allTerms[termID.termName] = allTerms[termID.termName] + 1 || 0;
        });

        // sort terms by usage frequency 
        let sortedTerms = [];
        for (let newTerm in allTerms) {
            sortedTerms.push([newTerm, allTerms[newTerm]]);
        }
        sortedTerms.sort((a, b) => b[1] - a[1]);

        // drop unused terms, only keep maximally appearing terms 
        let maxTermCount = sortedTerms[0][1];
        let validTerms = [];
        for (let i = 0; i < sortedTerms.length; i++) {
            if (sortedTerms[i][1] == maxTermCount) {
                validTerms.push(sortedTerms[i][0]);
            } else {
                break;
            }
        }

        // cull invalid terms from mostAccurate.termIDs
        let newTermIDs = [];
        for (let i = 0; i < mostAccurate.termIDs.length; i++) {
            if (validTerms.includes(mostAccurate.termIDs[i].termName)) {
                newTermIDs.push(mostAccurate.termIDs[i]);
            }
        }
        mostAccurate.termIDs = newTermIDs;

        // only include terms that equivalently appear max number of times
        for (let i = 1; i < sortedTerms.length; i++) {
            if (sortedTerms[i][1] == maxTermCount &&
                !mostAccurate.termIDs.includes(sortedTerms[i][0])) {
                mostAccurate.termIDs.push(sortedTerms[i][0]);
            } else {
                // may as well break out as soon as we drop below the max
                break;
            }
        }

        // after all that, we're STILL left with multiple potential terms 
        if (mostAccurate.termIDs.length > 1) {
            // separate dice coefficient list comparing each basic term name
            // to the given values, in order that they appear in the terms array 
            let mostAccurateTermIDIndex = 0;
            let topTermAccuracy = coeffBoundProbable;
            for (let i = 0; i < terms.length; i++) {
                for (let j = 0; j < mostAccurate.termIDs.length; j++) {
                    // compare each given termID.name to the base term name 
                    let newTermAccuracy = diceCoefficient(terms[i][0],
                        mostAccurate.termIDs[j].termName);
                    // IMPORTANT: use > because terms array is ordered 
                    // in descending importance   
                    if (newTermAccuracy > topTermAccuracy) {
                        topTermAccuracy = newTermAccuracy;
                        mostAccurateTermIDIndex = j;
                    }
                }
            }
            // done! we've found most accurate index in order of importance 
            let topTermID = mostAccurate.termIDs[mostAccurateTermIDIndex];
            mostAccurate.termIDs = [topTermID];
        }
    }

    let termName = mostAccurate.termIDs.length > 0 ?
        mostAccurate.termIDs[0].termName : null;
    let accuracy = termName == null ? -1 : mostAccurate.accuracy;
    return DCObject(termName, accuracy);
}

function UpdateTermsAccuracy(mostAccurate, newTerm, termName, inputString) {
    // get accuracy of new term vs input string 
    let newAccuracy = diceCoefficient(newTerm, inputString);
    if (newAccuracy > mostAccurate.accuracy) {
        // more accurate! reset term names 
        mostAccurate.accuracy = newAccuracy;
        // we store the term string itself AND the name of the term,
        // so that if we get multiple equally likely terms across different term names, 
        // we can check if one showed up more frequently in similarity than the other
        // and defer to that 
        mostAccurate.termIDs = [{ termString: newTerm, termName: termName }];
    } else if (newAccuracy == mostAccurate.accuracy) {
        // equally accurate! check that term ID doesn't already exist 
        let found = false;
        for (let i = 0; i < mostAccurate.termIDs.length; i++) {
            if (mostAccurate.termIDs[i].termName === termName &&
                mostAccurate.termIDs[i].termString === newTerm) {
                found = true;
                break;
            }
        };
        // check if new term found, and if so, add it 
        if (!found) {
            mostAccurate.termIDs.push({ termString: newTerm, termName: termName });
        }
    }
    // return updated object representing most accurate term(s) found 
    return mostAccurate;
}

function DCObject(termName = null, accuracy = -1) { return { termName: termName, accuracy: accuracy }; }


/**
 * Common terms found in data spreadsheets, typically column names. 
 * 
 * Ordered in approximate, VERY subjective estimation of likelihood / importance. 
 * 
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

    ['Coordinate',
        // plural/adjectives
        [
            'coordinates', 'coords',
            'co-ordinates', 'co-ords',
            'co_ordinates', 'co_ords',
        ],
        // common alt names 
        [
            'coord', 'crds', 'cds', 'crdnt',
            'co-ord', 'co-ordinate', 'crdt',
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
            'geopt', 'gpt', 'geo point', 'geo-point', 'geo_point',
        ],
        // common typos 
        [
            'geopont', 'gpoint', 'geopint', 'gopoint', 'gopint'
        ]],

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

/**
 * Potential delimiters found in names of {@link terms} to search, using regex
 */
const delimiters = /[\s\-_,.;+\/\\]+/;
