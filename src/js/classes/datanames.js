
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
 *  - x = 0: string, name of the term, eg "latitude"
 *  - x = 1: string[], plural/adjectives for term, eg "[latitudinal]"
 *  - x = 2: string[], common alt names for term, eg "[lat, lt]"
 *  - x = 3: string[], common typos for term, eg ["lattitude"]
 * @see {@link delimiters}
 */
const terms = [

    ['latitude',
        // plural/adjective
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

    ['longitude',
        // plural/adjective
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

    ['coordinate',
        // common alt names 
        [
        ],
        // common typos 
        [
        ]],

    ['geopoint',
        // common alt names 
        [
        ],
        // common typos 
        [
        ]],

    ['continent',
        // common alt names 
        [
        ],
        // common typos 
        [
        ]],

    ['country',
        // common alt names 
        [
        ],
        // common typos 
        [
        ]],

    ['city',
        // common alt names 
        [
        ],
        // common typos 
        [
        ]],

    ['town',
        // common alt names 
        [
        ],
        // common typos 
        [
        ]],

    ['region',
        // common alt names 
        [
        ],
        // common typos 
        [
        ]],

    ['name',
        // common alt names 
        [
        ],
        // common typos 
        [
        ]],

];


// terms to identify:
// latitude
// longitude
// coordinate
// geopoint
// continent
// country
// city
// town
// region
// name
