

/**
 * 
 * @param {string} inputString 
 * @returns {string}
 */
export function GetTerm(inputString) {

    // nullcheck + trim + tolowercase
    if (inputString == null) { return null; }
    inputString = inputString.trim().toLowerCase();

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

    // could not find valid comparison 
    return null;

}


/**
 * Potential delimiters found in names of {@link terms} to search
 */
const delimiters = [
    ' ', '-', '_', ',', '.', ';', '/', '\\'
];

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
            'coordinates', 'coords', 'orindates', 'ords'
        ],
        // common alt names 
        [
            'coord', 'co', 'ord', 'crds', 'cds'
        ],
        // common typos 
        [
            'cordinate', 'cordinates', 'coordanate', 'coordanats',
            'coordinats', 'cords'
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
            'geopt', 'gpt'
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
