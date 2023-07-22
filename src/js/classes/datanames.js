
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

    ['longitude',
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

    ['coordinate',
        // plural/adjectives
        [
            'coordinates', 'coords', 'orindates', 'ords'
        ],
        // common alt names 
        [
            'coord', 'ord', 'co'
        ],
        // common typos 
        [
            'cordinate', 'cordinates', 'coordanate', 'coordanats',
            'coordinats', 'cords'
        ]],

    ['geopoint',
        // plural/adjectives
        [
            'geopoints', 'gpts'
        ],
        // common alt names 
        [
            'geopt', 'gpt'
        ],
        // common typos 
        [
            'geopont', 'gpoint', 'geopint', 'gopoint', 'gopint'
        ]],

    ['continent',
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

    ['country',
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

    ['region',
        // plural/adjectives
        [
            'regions', 'states', 'provinces', 'prefectures', 'territories',
            'districts', 'divisions', 'divs'
        ],
        // common alt names 
        [
            'state', 'province', 'prov', 'admin', 'prefecture', 'pref', 'territory',
            'district', 'division', 'div'
        ],
        // common typos 
        [
            'regin', 'provinse', 'prv', 'prefecshure', 'teritory',
        ]],

    ['city',
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
